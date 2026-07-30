import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserEnvelopeDto } from "./dto/user-response.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiCookieAuth("hungr_session")
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ operationId: "getCurrentUser", summary: "Get current user" })
  @ApiOkResponse({ type: UserEnvelopeDto })
  async getCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserEnvelopeDto> {
    return {
      data: {
        user: await this.usersService.getCurrentUser(user.id),
      },
    };
  }

  @Patch("me")
  @ApiOperation({
    operationId: "updateCurrentUser",
    summary: "Update current user",
  })
  @ApiOkResponse({ type: UserEnvelopeDto })
  async updateCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateUserDto,
  ): Promise<UserEnvelopeDto> {
    return {
      data: {
        user: await this.usersService.updateCurrentUser(user.id, input),
      },
    };
  }
}
