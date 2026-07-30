import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {
  PASSWORD_HASH_ROUNDS,
} from "../common/constants/auth.constants";
import {
  toUserResponse,
  UserResponseDto,
} from "../users/dto/user-response.dto";
import type { UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { CredentialsDto } from "./dto/credentials.dto";

export interface AuthenticationResult {
  token: string;
  user: UserResponseDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: CredentialsDto): Promise<AuthenticationResult> {
    const passwordHash = await bcrypt.hash(
      input.password,
      PASSWORD_HASH_ROUNDS,
    );
    const user = await this.usersService.create(input.email, passwordHash);
    return this.createAuthenticationResult(user);
  }

  async login(input: CredentialsDto): Promise<AuthenticationResult> {
    const user = await this.usersService.findByEmailForAuth(input.email);
    const passwordHash = user?.local?.password;

    if (!user || !passwordHash) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(input.password, passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (bcrypt.getRounds(passwordHash) < PASSWORD_HASH_ROUNDS) {
      const upgradedHash = await bcrypt.hash(
        input.password,
        PASSWORD_HASH_ROUNDS,
      );
      await this.usersService.updatePasswordHash(
        user._id.toString(),
        upgradedHash,
      );
    }

    return this.createAuthenticationResult(user);
  }

  private async createAuthenticationResult(
    user: UserDocument,
  ): Promise<AuthenticationResult> {
    const token = await this.jwtService.signAsync({
      sub: user._id.toString(),
      email: user.email,
    });

    return {
      token,
      user: toUserResponse(user),
    };
  }
}
