import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cors from "cors";
import "dotenv/config";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";
import { env } from "./lib/env.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.useLogger(app.get(Logger));
  app.use(cookieParser());

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Middleware settings
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.setGlobalPrefix("api/v1");

  const config = new DocumentBuilder()
    .setTitle("Web Application Test API")
    .setDescription("The API documentation for the web application test")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(env.PORT);
  console.log(`Example app listening on port ${env.PORT}!`);
}
bootstrap();
