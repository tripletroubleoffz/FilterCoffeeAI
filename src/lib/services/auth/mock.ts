import { cookies } from 'next/headers';
import { IAuthService } from './interface';
import { db } from '../../db';
import { Role } from '@prisma/client';

export class MockAuthService implements IAuthService {
  async getSessionUser(req?: Request): Promise<any | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('fc_session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const email = sessionCookie.value;

    try {
      const user = await db.user.findUnique({
        where: { email },
        include: { subscription: true },
      });

      if (user) {
        return user;
      }

      // If mock user doesn't exist in DB, create them
      const newUser = await db.user.create({
        data: {
          email,
          name: email === 'founder@filtercoffee.ai' ? 'Founder' : 'Test User',
          authId: `mock_${Math.random().toString(36).substring(2, 11)}`,
          authProvider: 'MOCK',
          role: email === 'founder@filtercoffee.ai' ? Role.ADMIN : Role.USER,
        },
        include: { subscription: true },
      });

      await db.subscription.create({
        data: {
          userId: newUser.id,
          stripeCustomerId: `cus_mock_${Math.random().toString(36).substring(2, 11)}`,
          status: 'ACTIVE',
        }
      });

      return await db.user.findUnique({
        where: { id: newUser.id },
        include: { subscription: true },
      });

    } catch (error) {
      console.error('Mock session fetch error:', error);
      return null;
    }
  }

  async signIn(email: string): Promise<{ success: boolean; user: any }> {
    const cookieStore = await cookies();
    cookieStore.set('fc_session', email, { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return { success: true, user: { email } };
  }

  async signUp(email: string, name: string): Promise<{ success: boolean; user: any }> {
    const cookieStore = await cookies();
    cookieStore.set('fc_session', email, { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return { success: true, user: { email, name } };
  }

  async signOut(): Promise<{ success: boolean }> {
    const cookieStore = await cookies();
    cookieStore.delete('fc_session');
    return { success: true };
  }
}
