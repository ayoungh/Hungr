import { MongoMemoryServer } from "mongodb-memory-server";

async function startBrowserTestServer(): Promise<void> {
  const mongo = await MongoMemoryServer.create({
    instance: { ip: "127.0.0.1" },
  });

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = "browser-test-secret-that-is-at-least-32-characters";
  process.env.APP_ORIGIN = "http://127.0.0.1:3310";
  process.env.PORT = "4310";

  const { createApplication } = await import("../src/application");
  const app = await createApplication();
  await app.listen(4310, "127.0.0.1");

  const shutdown = async (): Promise<void> => {
    await app.close();
    await mongo.stop();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}

void startBrowserTestServer();
