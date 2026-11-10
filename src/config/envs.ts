import 'dotenv/config';
import * as z from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  STRIPE_SECRET: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_SUCCESS_URL: z.url(),
  STRIPE_CANCEL_URL: z.url(),
  // DATABASE_URL: z.string(),

  // NATS_SERVERS: z.array(z.string())
});

const validSchema = envSchema.safeParse({
  ...process.env,
  // NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (!validSchema.success) {
  console.error('Invalid environment variables: ', validSchema.error.issues);
  throw new Error('Invalid environment variables');
}

export const envs = {
  port: validSchema.data.PORT,
  stripeSecret: validSchema.data.STRIPE_SECRET,
  stripeWebhookSecret: validSchema.data.STRIPE_WEBHOOK_SECRET,
  stripeSuccessUrl: validSchema.data.STRIPE_SUCCESS_URL,
  stripeCancelUrl: validSchema.data.STRIPE_CANCEL_URL,
  // database_url: validSchema.data.DATABASE_URL,
  // natsServers: validSchema.data.NATS_SERVERS
}