import { IAuthService } from './interface';
import { SupabaseAuthService } from './supabase';
import { ClerkAuthService } from './clerk';
import { MockAuthService } from './mock';

let instance: IAuthService | null = null;

const authService = new Proxy({} as IAuthService, {
  get(target, prop) {
    if (!instance) {
      const provider = process.env.AUTH_PROVIDER || 'mock';
      if (provider === 'supabase') {
        instance = new SupabaseAuthService();
      } else if (provider === 'clerk') {
        instance = new ClerkAuthService();
      } else {
        instance = new MockAuthService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { authService };
export type { IAuthService };

