import { PurchaseIntentStatus } from '@prisma/client';

export interface CheckoutSessionInput {
  userId?: string;
  email: string;
  currentPlan: string;
  requestedPlan?: string;
  requestedCredits?: number;
  intentType: 'UPGRADE' | 'WAITLIST' | 'EARLY_ACCESS' | 'CUSTOM_REQUEST' | string;
  billingFrequency?: 'MONTHLY' | 'YEARLY' | string;
  sourcePage?: string;
  userAgent?: string;
  deviceType?: string;
  country?: string;
  referrer?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSessionResult {
  url?: string;
  success: boolean;
  message?: string;
  intentId?: string;
}

export interface PortalSessionResult {
  url: string;
}

export interface PurchaseIntentUpdateInput {
  intentId: string;
  status?: PurchaseIntentStatus;
  notes?: string;
}

export interface BillingAnalyticsResult {
  totalAttempts: number;
  pendingCount: number;
  reviewedCount: number;
  contactedCount: number;
  approvedCount: number;
  rejectedCount: number;
  popularPlans: { plan: string; count: number }[];
  intentGrowth: { date: string; count: number }[];
}
