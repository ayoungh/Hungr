import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateFoodDto } from "./dto/create-food.dto";
import {
  FoodResponseDto,
  toFoodResponse,
} from "./dto/food-response.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { Food, FoodDocument } from "./schemas/food.schema";

@Injectable()
export class FoodsService {
  constructor(
    @InjectModel(Food.name)
    private readonly foodModel: Model<Food>,
  ) {}

  async list(ownerId: string): Promise<FoodResponseDto[]> {
    const foods = await this.foodModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ createdAt: -1 })
      .exec();
    return foods.map((food) => toFoodResponse(food));
  }

  async create(
    ownerId: string,
    input: CreateFoodDto,
  ): Promise<FoodResponseDto> {
    const food = await this.foodModel.create({
      name: input.name.trim(),
      image: input.imageUrl ?? undefined,
      owner: new Types.ObjectId(ownerId),
    });
    return toFoodResponse(food);
  }

  async get(ownerId: string, id: string): Promise<FoodResponseDto> {
    return toFoodResponse(await this.findOwnedFood(ownerId, id));
  }

  async update(
    ownerId: string,
    id: string,
    input: UpdateFoodDto,
  ): Promise<FoodResponseDto> {
    const food = await this.findOwnedFood(ownerId, id);

    if (input.name !== undefined) {
      food.name = input.name.trim();
    }
    if (input.imageUrl !== undefined) {
      food.image = input.imageUrl ?? undefined;
    }

    await food.save();
    return toFoodResponse(food);
  }

  async delete(ownerId: string, id: string): Promise<void> {
    const result = await this.foodModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        owner: new Types.ObjectId(ownerId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException("Food not found.");
    }
  }

  private async findOwnedFood(
    ownerId: string,
    id: string,
  ): Promise<FoodDocument> {
    const food = await this.foodModel
      .findOne({
        _id: new Types.ObjectId(id),
        owner: new Types.ObjectId(ownerId),
      })
      .exec();

    if (!food) {
      throw new NotFoundException("Food not found.");
    }

    return food;
  }
}
