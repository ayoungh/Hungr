import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "../users/users.module";
import { FoodsController } from "./foods.controller";
import { FoodsService } from "./foods.service";
import { LegacyFoodOwnershipMigrationService } from "./legacy-food-ownership-migration.service";
import { Food, FoodSchema } from "./schemas/food.schema";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Food.name,
        schema: FoodSchema,
      },
    ]),
  ],
  controllers: [FoodsController],
  providers: [FoodsService, LegacyFoodOwnershipMigrationService],
  exports: [FoodsService, LegacyFoodOwnershipMigrationService],
})
export class FoodsModule {}
