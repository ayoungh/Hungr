import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { Food } from "./schemas/food.schema";

export interface OwnershipMigrationResult {
  mode: "dry-run" | "apply";
  ownerEmail: string | null;
  unownedFoods: number;
  assignedFoods: number;
}

@Injectable()
export class LegacyFoodOwnershipMigrationService {
  constructor(
    @InjectModel(Food.name)
    private readonly foodModel: Model<Food>,
    private readonly usersService: UsersService,
  ) {}

  async run(
    ownerEmail: string | undefined,
    apply: boolean,
  ): Promise<OwnershipMigrationResult> {
    const unownedFilter = {
      $or: [{ owner: { $exists: false } }, { owner: null }],
    };
    const unownedFoods = await this.foodModel.countDocuments(unownedFilter);

    if (!apply) {
      return {
        mode: "dry-run",
        ownerEmail: ownerEmail ?? null,
        unownedFoods,
        assignedFoods: 0,
      };
    }

    if (!ownerEmail) {
      throw new Error("--owner-email is required when using --apply.");
    }

    const owner = await this.usersService.findByEmail(ownerEmail);
    if (!owner) {
      throw new NotFoundException(
        `No user exists for owner email ${ownerEmail}.`,
      );
    }

    const result = await this.foodModel
      .updateMany(unownedFilter, { $set: { owner: owner._id } })
      .exec();

    return {
      mode: "apply",
      ownerEmail: owner.email,
      unownedFoods,
      assignedFoods: result.modifiedCount,
    };
  }
}
