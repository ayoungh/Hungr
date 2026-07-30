import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
} from "../common/constants/auth.constants";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { UserEnvelopeDto } from "../users/dto/user-response.dto";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { CredentialsDto } from "./dto/credentials.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ operationId: "register", summary: "Register an account" })
  @ApiCreatedResponse({ type: UserEnvelopeDto })
  async register(
    @Body() input: CredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserEnvelopeDto> {
    const result = await this.authService.register(input);
    this.setAuthenticationCookie(response, result.token);
    return { data: { user: result.user } };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ operationId: "login", summary: "Log in" })
  @ApiOkResponse({ type: UserEnvelopeDto })
  async login(
    @Body() input: CredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserEnvelopeDto> {
    const result = await this.authService.login(input);
    this.setAuthenticationCookie(response, result.token);
    return { data: { user: result.user } };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: "logout", summary: "Log out" })
  @ApiNoContentResponse()
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(AUTH_COOKIE_NAME, this.cookieSecurityOptions());
  }

  @Get("session")
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({
    operationId: "getSession",
    summary: "Get the authenticated session",
  })
  @ApiOkResponse({ type: UserEnvelopeDto })
  async session(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserEnvelopeDto> {
    return {
      data: {
        user: await this.usersService.getCurrentUser(user.id),
      },
    };
  }

  private setAuthenticationCookie(response: Response, token: string): void {
    response.cookie(AUTH_COOKIE_NAME, token, {
      ...this.cookieSecurityOptions(),
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
    });
  }

  private cookieSecurityOptions(): {
    httpOnly: true;
    sameSite: "strict";
    secure: boolean;
    path: "/";
  } {
    return {
      httpOnly: true,
      sameSite: "strict",
      secure: this.config.get<string>("NODE_ENV") === "production",
      path: "/",
    };
  }
}
