import { IAuthService } from './interface';
import { SupabaseAuthService } from './supabase';

let instance: IAuthService | null = null;

const authService = new Proxy({} as IAuthService, {
  get(target, prop) {
    if (!instance) {
      instance = new SupabaseAuthService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { authService };
export type { IAuthService };
