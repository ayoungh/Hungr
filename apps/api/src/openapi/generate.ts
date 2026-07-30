import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function generateOpenApi(): Promise<void> {
  process.env.OPENAPI_GENERATION = "true";

  const { createApplication, createOpenApiDocument } = await import(
    "../application"
  );
  const app = await createApplication();
  await app.init();

  const document = createOpenApiDocument(app);
  const outputPath = resolve(process.cwd(), "../../api-docs.json");
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  await app.close();
}

void generateOpenApi();
