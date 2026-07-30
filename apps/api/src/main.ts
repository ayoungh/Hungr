import { ConfigService } from "@nestjs/config";
import { createApplication } from "./application";

async function bootstrap(): Promise<void> {
  const app = await createApplication();
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>("PORT");

  await app.listen(port);
}

void bootstrap();
