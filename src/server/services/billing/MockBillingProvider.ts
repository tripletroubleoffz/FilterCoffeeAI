import { IBillingProvider } from './BillingProvider';
import { CheckoutSessionInput, CheckoutSessionResult, PortalSessionResult } from './BillingTypes';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class MockBillingProvider implements IBillingProvider {
  name = 'mock';

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    try {
      const intent = await db.purchaseIntent.create({
        data: {
          userId: input.userId || null,
          email: input.email,
          currentPlan: input.currentPlan,
          requestedPlan: input.requestedPlan || null,
          requestedCredits: input.requestedCredits || null,
          intentType: input.intentType,
          billingFrequency: input.billingFrequency || null,
          sourcePage: input.sourcePage || null,
          userAgent: input.userAgent || null,
          deviceType: input.deviceType || null,
          country: input.country || null,
          referrer: input.referrer || null,
          notes: input.notes || null,
          metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
          status: 'PENDING',
        },
      });

      return {
        success: true,
        intentId: intent.id,
        message: 'Mock purchase intent recorded successfully.',
      };
    } catch (err) {
      console.error('Error creating Mock purchase intent:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to record purchase intent.';
      return {
        success: false,
        message: errMsg,
      };
    }
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<PortalSessionResult> {
    return { url: returnUrl };
  }
}
