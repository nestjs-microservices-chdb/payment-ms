import { Request } from 'express';
import { BadRequestException, Inject, Injectable, Logger, type RawBodyRequest } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';

import { envs, NAST_SERVICE } from '../config/index.js';
import { PaymentSessionDto } from './dto/index.js';

@Injectable()
export class PaymentsService {

  private readonly stripe = new Stripe(envs.stripeSecret);
  private readonly logger = new Logger('payments-service');

  constructor(
    @Inject(NAST_SERVICE) private readonly client: ClientProxy
  ) { }

  async createPaymentSession({ currency, items, orderId }: PaymentSessionDto) {
    const lineItems = items.map(item => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    return this.stripe.checkout.sessions.create({
      // Colocar id  de orden
      payment_intent_data: {
        metadata: {
          orderId
        }
      },

      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    }).then(session => {
      return {
        cancelUrl: session.cancel_url,
        successUrl: session.success_url,
        url: session.url
      }
    })
  }

  async stripeWebhook(signature: string, request: RawBodyRequest<Request>) {
    let event: Stripe.Event;

    try {
      // Usamos request.rawBody en lugar de request.body
      event = this.stripe.webhooks.constructEvent(
        request.rawBody!,
        signature,
        envs.stripeWebhookSecret
      );
    } catch (err: any) {
      // Si la firma es inválida, Stripe arrojará un error
      throw new BadRequestException(`Webhook Error: ${err?.message}`);
    }

    // Aquí ya puedes usar 'event.type' con seguridad
    switch (event.type) {
      case 'charge.succeeded':
        const paymentIntent = event.data.object as Stripe.Charge;
        console.log(`Pago de ${paymentIntent.amount} procesado con éxito.`);
        console.log(`ID de la orden: ${paymentIntent.metadata.orderId}`);
        // Lógica de tu base de datos aquí
        const payload = {
          stripePaymentId: paymentIntent.id,
          orderId: paymentIntent.metadata.orderId,
          receiptUrl: paymentIntent.receipt_url,
        }

        // this.logger.log({ payload });
        this.client.emit('payment.succeeded', payload);

        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return { received: true };
  }

}
