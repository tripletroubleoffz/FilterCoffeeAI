import { IAuthService } from './interface';
import { MockAuthService } from './mock';
import { ClerkAuthService } from './clerk';

const authProvider = process.env.AUTH_PROVIDER || 'mock';

let authService: IAuthService;

if (authProvider === 'clerk' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('mock')) {
  authService = new ClerkAuthService();
} else {
  authService = new MockAuthService();
}

export { authService };
export type { IAuthService };
