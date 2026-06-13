import { IPaymentService } from './interface';
import { StripePaymentService } from './stripe';

let instance: IPaymentService | null = null;

const paymentService = new Proxy({} as IPaymentService, {
  get(target, prop) {
    if (!instance) {
      instance = new StripePaymentService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { paymentService };
export type { IPaymentService };
