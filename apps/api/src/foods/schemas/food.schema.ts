import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type FoodDocument = HydratedDocument<Food>;

@Schema({
  collection: "foods",
  timestamps: true,
  versionKey: false,
})
export class Food {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const FoodSchema = SchemaFactory.createForClass(Food);
FoodSchema.index({ owner: 1, createdAt: -1 });
