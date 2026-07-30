import { ApiProperty } from "@nestjs/swagger";
import type { UserDocument } from "../schemas/user.schema";

export class UserResponseDto {
  @ApiProperty({ example: "507f1f77bcf86cd799439011" })
  id: string;

  @ApiProperty({ example: "you@example.com" })
  email: string;

  @ApiProperty({ format: "date-time" })
  createdAt: string;

  @ApiProperty({ format: "date-time" })
  updatedAt: string;
}

export class UserDataDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class UserEnvelopeDto {
  @ApiProperty({ type: UserDataDto })
  data: UserDataDto;
}

export function toUserResponse(user: UserDocument): UserResponseDto {
  const createdAt = user.createdAt ?? user._id.getTimestamp();
  const updatedAt = user.updatedAt ?? createdAt;

  return {
    id: user._id.toString(),
    email: user.email,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
