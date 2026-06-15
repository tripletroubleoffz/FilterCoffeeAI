import { IPaymentService } from './interface';
import { StripePaymentService } from './stripe';
import { MockPaymentService } from './mock';
import { NonePaymentService } from './none';

let instance: IPaymentService | null = null;

const paymentService = new Proxy({} as IPaymentService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.PAYMENT_PROVIDER === 'none') {
        instance = new NonePaymentService();
      } else if (process.env.PAYMENT_PROVIDER === 'mock' || !process.env.STRIPE_API_KEY || process.env.STRIPE_API_KEY === 'mock-stripe-key') {
        instance = new MockPaymentService();
      } else {
        instance = new StripePaymentService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { paymentService };
export type { IPaymentService };

