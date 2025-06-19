import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Middleware settings
    app.use(helmet());

    // Enable CORS using NestJS built-in support
    app.enableCors();

    await app.listen(3001);
    console.log('Example app listening on port 3001!');
}
bootstrap();
