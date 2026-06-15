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

// Graceful validation warnings for development, but throw hard errors in production
if (typeof window === 'undefined') {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const missingKeys: string[] = [];

    // Check Database
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
      missingKeys.push('DATABASE_URL (relational database connection string)');
    }

    // Check Auth
    const authProvider = process.env.AUTH_PROVIDER;
    if (!authProvider || authProvider === 'mock') {
      missingKeys.push('AUTH_PROVIDER (must be "supabase" or "clerk")');
    } else if (authProvider === 'clerk') {
      if (!process.env.CLERK_SECRET_KEY) missingKeys.push('CLERK_SECRET_KEY');
      if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) missingKeys.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    } else if (authProvider === 'supabase') {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingKeys.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingKeys.push('SUPABASE_SERVICE_ROLE_KEY');
    }

    // Check Payment
    const paymentProvider = process.env.PAYMENT_PROVIDER;
    if (!paymentProvider || paymentProvider === 'mock') {
      missingKeys.push('PAYMENT_PROVIDER (must be "stripe" or "none")');
    } else if (paymentProvider === 'stripe') {
      if (!process.env.STRIPE_API_KEY || process.env.STRIPE_API_KEY === 'mock-stripe-key') missingKeys.push('STRIPE_API_KEY');
      if (!process.env.STRIPE_WEBHOOK_SECRET) missingKeys.push('STRIPE_WEBHOOK_SECRET');
    }

    // Check Email
    const emailProvider = process.env.EMAIL_PROVIDER;
    if (!emailProvider || emailProvider === 'mock') {
      missingKeys.push('EMAIL_PROVIDER (must be "resend")');
    } else if (emailProvider === 'resend') {
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'mock-resend-key') missingKeys.push('RESEND_API_KEY');
    }

    // Check AI
    const aiProvider = process.env.AI_PROVIDER;
    if (!aiProvider || aiProvider === 'mock') {
      missingKeys.push('AI_PROVIDER (must be "gemini", "openai", or "anthropic")');
    } else if (aiProvider === 'gemini') {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-gemini-key') missingKeys.push('GEMINI_API_KEY');
    } else if (aiProvider === 'openai') {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-openai-key') missingKeys.push('OPENAI_API_KEY');
    } else if (aiProvider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock-anthropic-key') missingKeys.push('ANTHROPIC_API_KEY');
    }

    // Check Vector
    const vectorProvider = process.env.VECTOR_PROVIDER;
    if (!vectorProvider || vectorProvider === 'mock') {
      missingKeys.push('VECTOR_PROVIDER (must be "qdrant")');
    } else if (vectorProvider === 'qdrant') {
      if (!process.env.QDRANT_URL || process.env.QDRANT_URL === 'mock') missingKeys.push('QDRANT_URL');
    }

    if (missingKeys.length > 0) {
      throw new Error(
        `[CRITICAL ENVIRONMENT ERROR] Production mode is enabled, but the following configurations are missing or incorrect:\n` +
        missingKeys.map(k => ` - ${k}`).join('\n') +
        `\nEnforce correct secrets in your environment panel.`
      );
    }
  } else {
    // Graceful warnings for development
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
}
