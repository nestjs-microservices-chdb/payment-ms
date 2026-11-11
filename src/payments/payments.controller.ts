import { Request } from 'express';
import { Body, Controller, Get, Headers, Post, Req, type RawBodyRequest } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import Stripe from 'stripe';

import { PaymentsService } from './payments.service.js';

import { PaymentSessionDto } from './dto/index.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  // @Post('create-payment-session')
  @MessagePattern('create.payment.session')
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto): Promise<{ cancelUrl: string | null; successUrl: string | null; url: string | null; }> {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment was successful'
    }
  }

  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment was canceled'
    }
  }

  @Post('webhook')
  stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>
  ) {
    return this.paymentsService.stripeWebhook(signature, request);
  }
}
