import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Removes extra received data than the defined on the DTO
      forbidNonWhitelisted: true, // Instead of removing extra data, throws an error that should not exist
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // API Prefix
  app.setGlobalPrefix('api/v2');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
