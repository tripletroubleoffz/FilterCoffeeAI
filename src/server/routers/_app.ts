import { router } from '../trpc';
import { signalsRouter } from './signals';
import { topicsRouter } from './topics';
import { billingRouter } from './billing';
import { adminRouter } from './admin';

export const appRouter = router({
  signals: signalsRouter,
  topics: topicsRouter,
  billing: billingRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
