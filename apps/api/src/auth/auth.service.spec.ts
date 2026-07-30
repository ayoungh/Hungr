import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { PASSWORD_HASH_ROUNDS } from "../common/constants/auth.constants";
import type { UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

function userDocument(password: string): UserDocument {
  return {
    _id: new Types.ObjectId(),
    email: "person@example.com",
    local: { password },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  } as UserDocument;
}

describe("AuthService", () => {
  it("hashes new passwords with the configured cost", async () => {
    let savedHash = "";
    const users = {
      create: jest.fn((_email: string, hash: string) => {
        savedHash = hash;
        return Promise.resolve(userDocument(hash));
      }),
    } as unknown as UsersService;
    const jwt = {
      signAsync: jest.fn().mockResolvedValue("signed-token"),
    } as unknown as JwtService;
    const service = new AuthService(users, jwt);

    await service.register({
      email: "person@example.com",
      password: "password123",
    });

    expect(bcrypt.getRounds(savedHash)).toBe(PASSWORD_HASH_ROUNDS);
  });

  it("upgrades a valid legacy password hash after login", async () => {
    const legacyHash = await bcrypt.hash("password123", 8);
    const users = {
      findByEmailForAuth: jest.fn().mockResolvedValue(userDocument(legacyHash)),
      updatePasswordHash: jest.fn().mockResolvedValue(undefined),
    } as unknown as UsersService;
    const jwt = {
      signAsync: jest.fn().mockResolvedValue("signed-token"),
    } as unknown as JwtService;
    const service = new AuthService(users, jwt);

    await service.login({
      email: "person@example.com",
      password: "password123",
    });

    expect(users.updatePasswordHash).toHaveBeenCalledTimes(1);
    const upgradedHash = (users.updatePasswordHash as jest.Mock).mock
      .calls[0][1] as string;
    expect(bcrypt.getRounds(upgradedHash)).toBe(PASSWORD_HASH_ROUNDS);
  });

  it("uses the same generic error for unknown users and wrong passwords", async () => {
    const users = {
      findByEmailForAuth: jest.fn().mockResolvedValue(null),
    } as unknown as UsersService;
    const service = new AuthService(
      users,
      { signAsync: jest.fn() } as unknown as JwtService,
    );

    await expect(
      service.login({
        email: "missing@example.com",
        password: "password123",
      }),
    ).rejects.toEqual(
      new UnauthorizedException("Invalid email or password."),
    );
  });
});
