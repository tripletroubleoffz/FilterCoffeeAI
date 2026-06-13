import { IPaymentService } from './interface';
import { MockPaymentService } from './mock';
import { StripePaymentService } from './stripe';

const paymentProvider = process.env.PAYMENT_PROVIDER || 'mock';

let paymentService: IPaymentService;

if (paymentProvider === 'stripe' && process.env.STRIPE_API_KEY && process.env.STRIPE_API_KEY !== 'mock-stripe-key') {
  try {
    paymentService = new StripePaymentService();
  } catch (e) {
    console.error('Failed to initialize Stripe service, falling back to mock payments:', e);
    paymentService = new MockPaymentService();
  }
} else {
  paymentService = new MockPaymentService();
}

export { paymentService };
export type { IPaymentService };
