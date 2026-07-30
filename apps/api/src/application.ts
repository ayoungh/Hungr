import {
  ConsoleLogger,
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerModule,
} from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";

export async function createApplication(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.NODE_ENV === "production",
      colors: process.env.NODE_ENV !== "production",
    }),
  });

  const config = app.get(ConfigService);
  const appOrigin = config.getOrThrow<string>("APP_ORIGIN");

  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "healthz", method: RequestMethod.GET }],
  });
  app.use(
    helmet({
      // Swagger UI uses inline bootstrap assets. The API still receives all
      // other Helmet protections; the Next.js application owns its own CSP.
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: appOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  const document = createOpenApiDocument(app);
  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "api/docs.json",
  });

  return app;
}

export function createOpenApiDocument(
  app: INestApplication,
): OpenAPIObject {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Hungr API")
    .setDescription("Private food sharing API for the Hungr application.")
    .setVersion("1.0.0")
    .addCookieAuth("hungr_session", {
      type: "apiKey",
      in: "cookie",
      name: "hungr_session",
    })
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}
