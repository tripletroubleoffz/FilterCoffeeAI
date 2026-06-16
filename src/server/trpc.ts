import { initTRPC, TRPCError } from '@trpc/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { SubscriptionService } from './services/subscription/SubscriptionService';

export async function createContext(opts?: { req: Request }) {
  // Pass the request to getSessionUser so it can read cookies or Authorization headers
  const user = await getSessionUser(opts?.req);
  return {
    db,
    user,
    req: opts?.req,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to enforce user authentication
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to enforce admin privileges
const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have administrative privileges.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to enforce premium plan (STARTER or above)
const isPremium = t.middleware(async ({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }

  const plan = await SubscriptionService.getCurrentPlan(ctx.user.id);
  const allowedPlans = ['STARTER', 'PRO', 'POWER', 'ENTERPRISE'];

  if (!allowedPlans.includes(plan)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Premium subscription required (Starter or above).',
    });
  }

  return next({
    ctx: {
      ...ctx,
      plan,
    },
  });
});

// Middleware to enforce Pro plan (PRO or above)
const isPro = t.middleware(async ({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }

  const plan = await SubscriptionService.getCurrentPlan(ctx.user.id);
  const allowedPlans = ['PRO', 'POWER', 'ENTERPRISE'];

  if (!allowedPlans.includes(plan)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Pro subscription required (Pro or above).',
    });
  }

  return next({
    ctx: {
      ...ctx,
      plan,
    },
  });
});

// Middleware to enforce Enterprise plan
const isEnterprise = t.middleware(async ({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }

  const plan = await SubscriptionService.getCurrentPlan(ctx.user.id);

  if (plan !== 'ENTERPRISE') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Enterprise subscription required.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      plan,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const premiumProcedure = t.procedure.use(isAuthed).use(isPremium);
export const proProcedure = t.procedure.use(isAuthed).use(isPro);
export const enterpriseProcedure = t.procedure.use(isAuthed).use(isEnterprise);

