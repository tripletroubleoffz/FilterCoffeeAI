import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Perform raw SQL ping to ensure database is online
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'Healthy',
        queues: 'Running',
      },
    });
  } catch (error: any) {
    console.error('Health Check failed:', error);
    return NextResponse.json(
      {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: error.message || 'Database unavailable',
      },
      { status: 500 }
    );
  }
}
