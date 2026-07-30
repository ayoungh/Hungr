import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AUTH_COOKIE_NAME } from "../../common/constants/auth.constants";
import type { AuthenticatedUser } from "../../common/interfaces/authenticated-user.interface";
import { UsersService } from "../../users/users.service";

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null =>
          (request.cookies as Record<string, string> | undefined)?.[
            AUTH_COOKIE_NAME
          ] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Authentication is no longer valid.");
    }

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }
}
