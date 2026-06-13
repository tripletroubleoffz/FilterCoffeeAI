import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';

const isMockClerk = !process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.includes('mock');

export async function getSessionUser() {
  if (isMockClerk) {
    // Check if mock user exists, if not create one
    let user = await db.user.findUnique({
      where: { clerkId: 'user_mock_123' },
      include: { subscription: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: 'user_mock_123',
          email: 'founder@filtercoffee.ai',
          name: 'Filter Coffee Founder',
          role: 'ADMIN', // Set as ADMIN by default for local review
        },
        include: { subscription: true },
      });

      // Initialize default active subscription for mock user
      await db.subscription.create({
        data: {
          userId: user.id,
          stripeCustomerId: 'cus_mock_123',
          status: 'ACTIVE',
        }
      });

      // Fetch user again with subscription included
      user = await db.user.findUnique({
        where: { id: user.id },
        include: { subscription: true },
      });
    }
    return user;
  }

  // Real Clerk Auth Flow
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;
      
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      user = await db.user.create({
        data: {
          clerkId: userId,
          email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Professional',
          role: email === 'founder@filtercoffee.ai' ? 'ADMIN' : 'USER',
        },
        include: { subscription: true },
      });

      // Create inactive subscription row
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
    console.error('Error fetching Clerk session, falling back to null user:', error);
    return null;
  }
}
