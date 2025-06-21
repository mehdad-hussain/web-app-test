import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cors from "cors";
import "dotenv/config";
import { AppModule } from "./app.module.js";
import { env } from "./lib/env.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware settings
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

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
