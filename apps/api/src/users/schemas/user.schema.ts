import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: "users",
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ trim: true, lowercase: true, index: true })
  username?: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: false })
  isAdmin?: boolean;

  @Prop({
    type: {
      password: {
        type: String,
        required: true,
        select: false,
      },
    },
    required: true,
  })
  local: {
    password: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
