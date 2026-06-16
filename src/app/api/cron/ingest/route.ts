import { NextResponse } from 'next/server';
import { IngestionScheduler } from '@/server/services/ingestion/IngestionScheduler';

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

  // Parse the schedule interval parameter
  const { searchParams } = new URL(request.url);
  const schedule = searchParams.get('schedule') || 'daily';

  try {
    console.log(`[Cron] Triggering automatic feed ingestion for schedule: ${schedule}`);
    
    switch (schedule) {
      case '15min':
        await IngestionScheduler.run15MinJobs();
        break;
      case '30min':
        await IngestionScheduler.run30MinJobs();
        break;
      case 'hourly':
        await IngestionScheduler.runHourlyJobs();
        break;
      case 'daily':
        await IngestionScheduler.runDailyJobs();
        break;
      case 'weekly':
        await IngestionScheduler.runWeeklyJobs();
        break;
      case 'monthly':
        await IngestionScheduler.runMonthlyJobs();
        break;
      default:
        console.warn(`[Cron] Unknown schedule interval "${schedule}". Defaulting to daily.`);
        await IngestionScheduler.runDailyJobs();
        break;
    }

    return NextResponse.json({ success: true, message: `Ingestion for schedule [${schedule}] completed successfully` });
  } catch (error: any) {
    console.error(`[Cron] Ingestion for schedule [${schedule}] failed:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
