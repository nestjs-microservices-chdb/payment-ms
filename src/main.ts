import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module.js';
import { envs } from './config/index.js';

async function bootstrap() {

  const logger = new Logger('Payment-ms');

  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(envs.port ?? 3000);

  logger.log(`Payments Microservice running on port ${envs.port ?? 3000}`);
}
await bootstrap();
