import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module.js';

@Module({
  imports: [PaymentsModule],
})
export class AppModule { }
