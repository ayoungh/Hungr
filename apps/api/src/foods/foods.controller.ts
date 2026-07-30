import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { ParseObjectIdPipe } from "../common/pipes/parse-object-id.pipe";
import { CreateFoodDto } from "./dto/create-food.dto";
import {
  FoodEnvelopeDto,
  FoodListEnvelopeDto,
} from "./dto/food-response.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { FoodsService } from "./foods.service";

@ApiTags("Foods")
@ApiCookieAuth("hungr_session")
@UseGuards(JwtAuthGuard)
@Controller("foods")
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  @ApiOperation({ operationId: "listFoods", summary: "List your foods" })
  @ApiOkResponse({ type: FoodListEnvelopeDto })
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FoodListEnvelopeDto> {
    return { data: { foods: await this.foodsService.list(user.id) } };
  }

  @Post()
  @ApiOperation({ operationId: "createFood", summary: "Create a food" })
  @ApiCreatedResponse({ type: FoodEnvelopeDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateFoodDto,
  ): Promise<FoodEnvelopeDto> {
    return {
      data: { food: await this.foodsService.create(user.id, input) },
    };
  }

  @Get(":id")
  @ApiOperation({ operationId: "getFood", summary: "Get one of your foods" })
  @ApiOkResponse({ type: FoodEnvelopeDto })
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseObjectIdPipe) id: string,
  ): Promise<FoodEnvelopeDto> {
    return { data: { food: await this.foodsService.get(user.id, id) } };
  }

  @Patch(":id")
  @ApiOperation({ operationId: "updateFood", summary: "Update your food" })
  @ApiOkResponse({ type: FoodEnvelopeDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() input: UpdateFoodDto,
  ): Promise<FoodEnvelopeDto> {
    return {
      data: { food: await this.foodsService.update(user.id, id, input) },
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: "deleteFood", summary: "Delete your food" })
  @ApiNoContentResponse()
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.foodsService.delete(user.id, id);
  }
}
