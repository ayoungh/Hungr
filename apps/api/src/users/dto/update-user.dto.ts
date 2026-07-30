import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "new-email@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}
