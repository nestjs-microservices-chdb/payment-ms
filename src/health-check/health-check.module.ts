import { Module } from '@nestjs/common';
import { HealtCheckController } from './healt-check.controller.js';

@Module({
  controllers: [HealtCheckController]
})
export class HealthCheckModule {}
