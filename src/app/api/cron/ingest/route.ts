import { NextResponse } from 'next/server';
import { runAllIngestions } from '@/lib/worker';

// Force dynamic evaluation to prevent Next.js from aggressively caching the cron route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Security check: Vercel sends a CRON_SECRET header to prevent unauthorized invocations
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Triggering automatic feed ingestion via Vercel Cron');
    // Using a promise without awaiting so we don't block the cron response
    // Vercel serverless functions might terminate background promises early
    // So if using Vercel, it is better to await it if under maxDuration.
    // Assuming maxDuration is 60s for Pro accounts or 10s for Hobby.
    await runAllIngestions();
    return NextResponse.json({ success: true, message: 'Ingestion completed successfully' });
  } catch (error: any) {
    console.error('[Cron] Feed ingestion failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
