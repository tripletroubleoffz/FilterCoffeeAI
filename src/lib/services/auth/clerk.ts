import { IAuthService } from './interface';
import { db } from '../../db';
import { auth, currentUser } from '@clerk/nextjs/server';

export class ClerkAuthService implements IAuthService {
  async getSessionUser(req?: Request): Promise<any | null> {
    try {
      const { userId } = await auth();
      if (!userId) return null;

      let user = await db.user.findFirst({
        where: { supabaseId: userId },
        include: { subscription: true },
      });

      if (!user) {
        const clerkUser = await currentUser();
        if (!clerkUser) return null;
        
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        user = await db.user.create({
          data: {
            supabaseId: userId,
            email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Professional',
            role: email === 'founder@filtercoffee.ai' ? 'ADMIN' : 'USER',
          },
          include: { subscription: true },
        });

        // Initialize inactive subscription row
        await db.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 11)}`,
            status: 'INACTIVE',
          }
        });

        // Re-fetch
        user = await db.user.findUnique({
          where: { id: user.id },
          include: { subscription: true },
        });
      }

      return user;
    } catch (error) {
      console.error('Clerk session fetch error:', error);
      return null;
    }
  }

  // Frontend routes in Clerk handle redirect signin flows
  async signIn(email: string): Promise<{ success: boolean; user: any }> {
    throw new Error('Sign-in must be initiated by Clerk client components.');
  }

  async signUp(email: string, name: string): Promise<{ success: boolean; user: any }> {
    throw new Error('Sign-up must be initiated by Clerk client components.');
  }

  async signOut(): Promise<{ success: boolean }> {
    return { success: true };
  }
}
