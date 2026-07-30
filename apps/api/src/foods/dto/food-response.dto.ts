import { ApiProperty } from "@nestjs/swagger";
import type { FoodDocument } from "../schemas/food.schema";

export class FoodResponseDto {
  @ApiProperty({ example: "507f1f77bcf86cd799439011" })
  id: string;

  @ApiProperty({ example: "Tacos" })
  name: string;

  @ApiProperty({
    type: String,
    example: "https://example.com/tacos.jpg",
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt: string;

  @ApiProperty({ format: "date-time" })
  updatedAt: string;
}

export class FoodDataDto {
  @ApiProperty({ type: FoodResponseDto })
  food: FoodResponseDto;
}

export class FoodEnvelopeDto {
  @ApiProperty({ type: FoodDataDto })
  data: FoodDataDto;
}

export class FoodListDataDto {
  @ApiProperty({ type: [FoodResponseDto] })
  foods: FoodResponseDto[];
}

export class FoodListEnvelopeDto {
  @ApiProperty({ type: FoodListDataDto })
  data: FoodListDataDto;
}

export function toFoodResponse(food: FoodDocument): FoodResponseDto {
  const createdAt = food.createdAt ?? food._id.getTimestamp();
  const updatedAt = food.updatedAt ?? createdAt;

  return {
    id: food._id.toString(),
    name: food.name,
    imageUrl: food.image ?? null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
