import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { NastModule } from '../transports/nast.module.js';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [NastModule],
})
export class PaymentsModule { }
