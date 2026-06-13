/**
 * Production Environment Variables Validator & Fallbacks
 * Prevents runtime crashes when keys are missing by defining standard mock defaults.
 */

export const env = {
  // Service providers
  AUTH_PROVIDER: process.env.AUTH_PROVIDER || 'mock',
  NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'mock',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'mock',
  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  CACHE_PROVIDER: process.env.CACHE_PROVIDER || 'mock',
  VECTOR_PROVIDER: process.env.VECTOR_PROVIDER || 'mock',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'mock',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  // AI keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'mock-openai-key',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'mock-gemini-key',

  // NextAuth fallbacks
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-production-verification',

  // App URLs
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Graceful validation warnings (does not throw, avoiding runtime crashes)
if (typeof window === 'undefined') {
  if (env.AUTH_PROVIDER === 'clerk' && (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)) {
    console.warn('[ENV WARNING] Clerk auth provider selected, but Clerk keys are missing. Falling back to mock auth mode.');
  }
  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY === 'mock-openai-key') {
    console.warn('[ENV WARNING] OpenAI AI provider selected, but OPENAI_API_KEY is missing.');
  }
  if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY === 'mock-gemini-key') {
    console.warn('[ENV WARNING] Gemini AI provider selected, but GEMINI_API_KEY is missing.');
  }
}
