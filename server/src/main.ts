import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cors from "cors";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware settings
  app.use(
    cors({
      origin: "http://localhost:5173", // or your frontend origin
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

  await app.listen(3000);
  console.log("Example app listening on port 3000!");
}
bootstrap();
