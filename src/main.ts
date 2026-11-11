import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

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

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers ?? ['nats://nats-server:4222']
    }
  }, { inheritAppConfig: true });

  await app.startAllMicroservices();
  await app.listen(envs.port ?? 3000);

  logger.log(`Payments Microservice running on port ${envs.port ?? 3000}`);
}
await bootstrap();
