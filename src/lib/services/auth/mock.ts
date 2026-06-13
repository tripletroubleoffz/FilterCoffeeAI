import { IAuthService } from './interface';
import { db } from '../../db';
import { cookies } from 'next/headers';

export class MockAuthService implements IAuthService {
  async getSessionUser(): Promise<any | null> {
    try {
      const cookieStore = await cookies();
      const mockUserId = cookieStore.get('fc_session')?.value;
      
      if (!mockUserId) {
        return null;
      }

      return db.user.findUnique({
        where: { id: mockUserId },
        include: { subscription: true },
      });
    } catch (e) {
      // Return null if cookie store is accessed in non-server context
      return null;
    }
  }

  async signIn(email: string): Promise<{ success: boolean; user: any }> {
    let user = await db.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user) {
      // Create user automatically in mock mode to ease testing
      user = await db.user.create({
        data: {
          email,
          name: email.split('@')[0],
          clerkId: 'mock_' + Math.random().toString(36).substring(2, 9),
          role: email.includes('admin') || email.includes('founder') ? 'ADMIN' : 'USER',
        },
        include: { subscription: true },
      });

      // Default active subscription for mock accounts
      await db.subscription.create({
        data: {
          userId: user.id,
          stripeCustomerId: 'cus_mock_' + Math.random().toString(36).substring(2, 9),
          status: 'ACTIVE',
        }
      });

      // Re-fetch
      user = await db.user.findUnique({
        where: { id: user.id },
        include: { subscription: true },
      });
    }

    if (!user) {
      throw new Error('Mock user not found.');
    }

    const cookieStore = await cookies();
    cookieStore.set('fc_session', user.id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 }); // 7 days

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'MOCK_SIGN_IN',
        details: `User ${email} signed in via mock authentication.`,
      },
    });

    return { success: true, user };
  }

  async signUp(email: string, name: string): Promise<{ success: boolean; user: any }> {
    let user = await db.user.findUnique({ where: { email } });
    if (user) {
      throw new Error('Email already registered');
    }

    user = await db.user.create({
      data: {
        email,
        name,
        clerkId: 'mock_' + Math.random().toString(36).substring(2, 9),
        role: email.includes('admin') || email.includes('founder') ? 'ADMIN' : 'USER',
      },
      include: { subscription: true },
    });

    await db.subscription.create({
      data: {
        userId: user.id,
        stripeCustomerId: 'cus_mock_' + Math.random().toString(36).substring(2, 9),
        status: 'ACTIVE',
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('fc_session', user.id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

    // Re-fetch
    user = await db.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error('Mock user registration failed.');
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'MOCK_SIGN_UP',
        details: `User ${email} registered and signed in via mock authentication.`,
      },
    });

    return { success: true, user };
  }

  async signOut(): Promise<{ success: boolean }> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete('fc_session');
    } catch (e) {
      // ignore
    }
    return { success: true };
  }
}
