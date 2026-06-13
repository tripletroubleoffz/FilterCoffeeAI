import { router } from '../trpc';
import { signalsRouter } from './signals';
import { topicsRouter } from './topics';
import { billingRouter } from './billing';
import { adminRouter } from './admin';
import { contactRouter } from './contact';

export const appRouter = router({
  signals: signalsRouter,
  topics: topicsRouter,
  billing: billingRouter,
  admin: adminRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
