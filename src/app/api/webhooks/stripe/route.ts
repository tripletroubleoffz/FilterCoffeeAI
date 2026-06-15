import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_API_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(apiKey || 'mock-stripe-key', {
  apiVersion: '2025-01-27' as any,
});

export async function POST(req: Request) {
  if (!apiKey || apiKey === 'mock-stripe-key') {
    console.warn('[Stripe Webhook] Stripe API key is mock or unconfigured. Webhooks disabled.');
    return NextResponse.json({ message: 'Webhook ignored (Mock Mode)' }, { status: 200 });
  }

  if (!webhookSecret || webhookSecret === 'whsec_mockstripewebhook') {
    console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET configuration.');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 400 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header.');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let body: string;
  try {
    body = await req.text();
  } catch (err: any) {
    console.error('[Stripe Webhook] Failed to read request body:', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event type: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planCode = session.metadata?.planCode;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId || !planCode) {
          console.error('[Stripe Webhook] Missing metadata in checkout session:', session.id);
          return NextResponse.json({ error: 'Missing metadata in session' }, { status: 400 });
        }

        // Fetch subscription details from Stripe to get period dates and price details
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId) as any;
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        const stripePriceId = stripeSubscription.items.data[0]?.price.id;

        // Upsert the subscription record
        await db.subscription.upsert({
          where: { userId },
          update: {
            status: 'ACTIVE',
            stripeCustomerId,
            stripePriceId,
            currentPeriodEnd,
          },
          create: {
            userId,
            stripeCustomerId,
            stripePriceId,
            status: 'ACTIVE',
            currentPeriodEnd,
          },
        });

        await db.auditLog.create({
          data: {
            userId,
            action: 'BILLING_UPGRADE_STRIPE',
            details: `Stripe Checkout completed for plan ${planCode}. Customer: ${stripeCustomerId}, Subscription: ${stripeSubscriptionId}`,
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const stripeCustomerId = invoice.customer as string;
        const stripeSubscriptionId = invoice.subscription as string;

        if (stripeSubscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId) as any;
          const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
          const stripePriceId = stripeSubscription.items.data[0]?.price.id;

          const sub = await db.subscription.findUnique({
            where: { stripeCustomerId },
          });

          if (sub) {
            await db.subscription.update({
              where: { id: sub.id },
              data: {
                status: 'ACTIVE',
                stripePriceId,
                currentPeriodEnd,
              },
            });

            await db.payment.create({
              data: {
                subscriptionId: sub.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                stripeChargeId: (invoice.charge as string) || `ch_inv_${invoice.id}`,
                status: 'succeeded',
              },
            });

            await db.auditLog.create({
              data: {
                userId: sub.userId,
                action: 'BILLING_PAYMENT_SUCCESS',
                details: `Stripe payment succeeded for invoice ${invoice.id}. Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`,
              },
            });
          } else {
            console.warn(`[Stripe Webhook] No local subscription found for Stripe customer: ${stripeCustomerId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const stripeCustomerId = invoice.customer as string;

        const sub = await db.subscription.findUnique({
          where: { stripeCustomerId },
        });

        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: {
              status: 'PAST_DUE',
            },
          });

          await db.auditLog.create({
            data: {
              userId: sub.userId,
              action: 'BILLING_PAYMENT_FAILED',
              details: `Stripe payment failed for invoice ${invoice.id}. Status set to PAST_DUE.`,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as any;
        const stripeCustomerId = stripeSubscription.customer as string;

        const sub = await db.subscription.findUnique({
          where: { stripeCustomerId },
        });

        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: {
              status: 'CANCELED',
            },
          });

          await db.auditLog.create({
            data: {
              userId: sub.userId,
              action: 'BILLING_CANCELED',
              details: `Stripe subscription deleted/canceled. Local status set to CANCELED.`,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object as any;
        const stripeCustomerId = stripeSubscription.customer as string;
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        const stripePriceId = stripeSubscription.items.data[0]?.price.id;

        let status = 'INACTIVE';
        if (stripeSubscription.status === 'active') {
          status = 'ACTIVE';
        } else if (stripeSubscription.status === 'past_due') {
          status = 'PAST_DUE';
        } else if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
          status = 'CANCELED';
        } else if (stripeSubscription.status === 'trialing') {
          status = 'TRIALING';
        }

        const sub = await db.subscription.findUnique({
          where: { stripeCustomerId },
        });

        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: {
              status,
              stripePriceId,
              currentPeriodEnd,
            },
          });

          await db.auditLog.create({
            data: {
              userId: sub.userId,
              action: 'BILLING_UPDATE',
              details: `Stripe subscription updated. Status: ${status}, Price ID: ${stripePriceId}`,
            },
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error processing event:`, err);
    return NextResponse.json({ error: `Internal Server Error: ${err.message}` }, { status: 500 });
  }
}
