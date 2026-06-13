import { IAuthService } from './interface';
import { ClerkAuthService } from './clerk';

import { MockAuthService } from './mock';

let instance: IAuthService | null = null;

const authService = new Proxy({} as IAuthService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.AUTH_PROVIDER === 'mock' || process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock') {
        instance = new MockAuthService();
      } else {
        instance = new ClerkAuthService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { authService };
export type { IAuthService };
