import { Request } from 'express';
import { BadRequestException, Injectable, type RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';

import { envs } from '../config/index.js';
import { PaymentSessionDto } from './dto/index.js';

@Injectable()
export class PaymentsService {

  private readonly stripe = new Stripe(envs.stripeSecret);

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
        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return { received: true };
  }

}
