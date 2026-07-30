import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateFoodDto {
  @ApiProperty({ example: "Tacos", maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiProperty({
    type: String,
    example: "https://example.com/tacos.jpg",
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUrl({ protocols: ["http", "https"], require_protocol: true })
  imageUrl?: string | null;
}
