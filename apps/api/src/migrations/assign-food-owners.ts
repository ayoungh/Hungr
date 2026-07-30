import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { LegacyFoodOwnershipMigrationService } from "../foods/legacy-food-ownership-migration.service";

function argumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function migrate(): Promise<void> {
  const logger = new Logger("AssignFoodOwners");
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LegacyFoodOwnershipMigrationService);
    const result = await service.run(
      argumentValue("--owner-email"),
      process.argv.includes("--apply"),
    );
    logger.log(JSON.stringify(result));
  } finally {
    await app.close();
  }
}

void migrate();
