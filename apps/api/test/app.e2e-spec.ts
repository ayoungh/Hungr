import type { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import * as bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { Model } from "mongoose";
import { Connection } from "mongoose";
import request from "supertest";
import { getConnectionToken } from "@nestjs/mongoose";
import { PASSWORD_HASH_ROUNDS } from "../src/common/constants/auth.constants";
import { Food } from "../src/foods/schemas/food.schema";
import { LegacyFoodOwnershipMigrationService } from "../src/foods/legacy-food-ownership-migration.service";
import { UsersService } from "../src/users/users.service";

jest.setTimeout(30_000);

describe("Hungr API (e2e)", () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let connection: Connection;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: { ip: "127.0.0.1" },
    });
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = "e2e-test-secret-that-is-at-least-32-characters";
    process.env.APP_ORIGIN = "http://localhost:3000";

    const { createApplication } = await import("../src/application");
    app = await createApplication();
    await app.init();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(connection.collections).map((collection) =>
        collection.deleteMany({}),
      ),
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongo) {
      await mongo.stop();
    }
  });

  async function register(
    email: string,
    agent: ReturnType<typeof request.agent> = request.agent(app.getHttpServer()),
  ): Promise<ReturnType<typeof request.agent>> {
    const response = await agent
      .post("/api/v1/auth/register")
      .set("Origin", "http://localhost:3000")
      .send({ email, password: "password123" })
      .expect(201);

    expect(response.body.data.user).toMatchObject({
      email,
    });
    expect(response.body.data.user.id).toBeDefined();
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    return agent;
  }

  it("registers, restores a session, logs out, and rejects the cleared session", async () => {
    const agent = await register("session@example.com");

    await agent
      .get("/api/v1/auth/session")
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.user.email).toBe("session@example.com");
      });

    await agent
      .post("/api/v1/auth/logout")
      .set("Origin", "http://localhost:3000")
      .expect(204);

    await agent.get("/api/v1/auth/session").expect(401);
  });

  it("validates input, rejects unknown fields, and reports duplicate email conflicts", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .set("Origin", "http://localhost:3000")
      .send({ email: "invalid", password: "short", admin: true })
      .expect(400)
      .expect(({ body }) => {
        expect(body.error.code).toBe("BAD_REQUEST");
        expect(body.error.details).toEqual(
          expect.arrayContaining([
            expect.stringContaining("property admin should not exist"),
          ]),
        );
      });

    await register("duplicate@example.com");
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .set("Origin", "http://localhost:3000")
      .send({ email: "duplicate@example.com", password: "password123" })
      .expect(409);
  });

  it("rejects unsafe browser requests from another origin", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .set("Origin", "https://attacker.example")
      .send({ email: "blocked@example.com", password: "password123" })
      .expect(403);
  });

  it("creates, lists, updates, and deletes owner-scoped foods", async () => {
    const agent = await register("food-owner@example.com");
    const createResponse = await agent
      .post("/api/v1/foods")
      .set("Origin", "http://localhost:3000")
      .send({
        name: "Tacos",
        imageUrl: "https://example.com/tacos.jpg",
      })
      .expect(201);

    const food = createResponse.body.data.food;
    expect(food).toMatchObject({
      name: "Tacos",
      imageUrl: "https://example.com/tacos.jpg",
    });
    expect(food._id).toBeUndefined();

    await agent
      .get("/api/v1/foods")
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.foods).toHaveLength(1);
      });

    await agent
      .patch(`/api/v1/foods/${food.id}`)
      .set("Origin", "http://localhost:3000")
      .send({ name: "Updated tacos", imageUrl: null })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.food).toMatchObject({
          name: "Updated tacos",
          imageUrl: null,
        });
      });

    await agent
      .delete(`/api/v1/foods/${food.id}`)
      .set("Origin", "http://localhost:3000")
      .expect(204);
    await agent.get(`/api/v1/foods/${food.id}`).expect(404);
  });

  it("conceals another user's food with a 404", async () => {
    const owner = await register("owner@example.com");
    const otherUser = await register("other@example.com");
    const createResponse = await owner
      .post("/api/v1/foods")
      .set("Origin", "http://localhost:3000")
      .send({ name: "Private dish" })
      .expect(201);
    const id = createResponse.body.data.food.id as string;

    await otherUser.get(`/api/v1/foods/${id}`).expect(404);
    await otherUser
      .patch(`/api/v1/foods/${id}`)
      .set("Origin", "http://localhost:3000")
      .send({ name: "Stolen dish" })
      .expect(404);
    await otherUser
      .delete(`/api/v1/foods/${id}`)
      .set("Origin", "http://localhost:3000")
      .expect(404);
  });

  it("rejects unauthenticated requests and malformed ids", async () => {
    await request(app.getHttpServer()).get("/api/v1/foods").expect(401);
    const agent = await register("ids@example.com");
    await agent.get("/api/v1/foods/not-an-object-id").expect(400);
  });

  it("supports current-user reads and email updates without exposing all users", async () => {
    const agent = await register("before@example.com");
    await agent
      .patch("/api/v1/users/me")
      .set("Origin", "http://localhost:3000")
      .send({ email: "after@example.com" })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.user.email).toBe("after@example.com");
      });

    await request(app.getHttpServer()).get("/api/v1/users").expect(404);
  });

  it("rehashes legacy passwords after successful login", async () => {
    const users = app.get(UsersService);
    const legacyHash = await bcrypt.hash("password123", 8);
    const user = await users.create("legacy@example.com", legacyHash);

    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "legacy@example.com", password: "password123" })
      .expect(200);

    const updated = await users.findByEmailForAuth("legacy@example.com");
    expect(updated?._id.toString()).toBe(user._id.toString());
    expect(bcrypt.getRounds(updated?.local.password ?? "")).toBe(
      PASSWORD_HASH_ROUNDS,
    );
  });

  it("exposes Mongo-aware health and the generated OpenAPI contract", async () => {
    await request(app.getHttpServer())
      .get("/healthz")
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe("ok");
        expect(body.info.mongodb.status).toBe("up");
      });

    await request(app.getHttpServer())
      .get("/api/docs.json")
      .expect(200)
      .expect(({ body }) => {
        expect(body.paths["/api/v1/auth/login"]).toBeDefined();
        expect(body.paths["/api/v1/foods/{id}"]).toBeDefined();
      });
  });

  it("keeps ownership migration dry-run-first, explicit, and idempotent", async () => {
    const users = app.get(UsersService);
    const owner = await users.create(
      "migration@example.com",
      await bcrypt.hash("password123", PASSWORD_HASH_ROUNDS),
    );
    const foodModel = app.get<Model<Food>>(getModelToken(Food.name));
    await foodModel.collection.insertOne({
      name: "Legacy food",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const migration = app.get(LegacyFoodOwnershipMigrationService);

    const dryRun = await migration.run(undefined, false);
    expect(dryRun).toMatchObject({
      mode: "dry-run",
      unownedFoods: 1,
      assignedFoods: 0,
    });

    const applied = await migration.run("migration@example.com", true);
    expect(applied.assignedFoods).toBe(1);
    const repeated = await migration.run("migration@example.com", true);
    expect(repeated).toMatchObject({
      unownedFoods: 0,
      assignedFoods: 0,
    });

    const migratedFood = await foodModel.findOne({ name: "Legacy food" });
    expect(migratedFood?.owner.toString()).toBe(owner._id.toString());
  });
});
