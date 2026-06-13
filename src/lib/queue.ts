import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { ingestSource, generateUserDigest } from './worker';

let redisConnection: Redis | null = null;
let ingestionQueue: Queue | null = null;
let digestQueue: Queue | null = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL && REDIS_URL !== 'mock') {
  try {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
    });
    
    redisConnection.on('error', (err) => {
      // Log connection warnings but allow fallback
      console.warn('Redis connection warning. Queue running in fallback local scheduler:', err.message);
    });
  } catch (e) {
    console.warn('Failed to create Redis connection client. Using offline background job scheduler.');
  }
}

export function initQueues() {
  if (redisConnection) {
    try {
      ingestionQueue = new Queue('ingestion-jobs', { connection: redisConnection as any });
      digestQueue = new Queue('digest-jobs', { connection: redisConnection as any });
      console.log('BullMQ Queues initialized successfully.');
      return;
    } catch (e) {
      console.error('Failed to initialize BullMQ queues, falling back to local queue.');
    }
  }

  console.log('Offline Background Scheduler initialized.');
}

export async function addIngestionJob(sourceId: string) {
  if (ingestionQueue) {
    await ingestionQueue.add('ingest', { sourceId }, { attempts: 3, backoff: 5000 });
    return;
  }
  
  // Local asynchronous mock trigger
  console.log(`[Queue Mock] Added Ingestion Job for source ${sourceId}. Executing in background...`);
  setTimeout(async () => {
    try {
      await ingestSource(sourceId);
    } catch (e) {
      console.error(`[Queue Mock] Ingestion failed for source ${sourceId}:`, e);
    }
  }, 100);
}

export async function addDigestJob(userId: string, frequency: string) {
  if (digestQueue) {
    await digestQueue.add('digest', { userId, frequency }, { attempts: 2, backoff: 10000 });
    return;
  }

  // Local asynchronous mock trigger
  console.log(`[Queue Mock] Added Digest Job for user ${userId} (${frequency}). Executing in background...`);
  setTimeout(async () => {
    try {
      await generateUserDigest(userId, frequency);
    } catch (e) {
      console.error(`[Queue Mock] Digest generation failed for user ${userId}:`, e);
    }
  }, 100);
}

export function startWorkers() {
  if (redisConnection) {
    try {
      const ingestWorker = new Worker('ingestion-jobs', async (job) => {
        await ingestSource(job.data.sourceId);
      }, { connection: redisConnection as any });

      const digestWorker = new Worker('digest-jobs', async (job) => {
        await generateUserDigest(job.data.userId, job.data.frequency);
      }, { connection: redisConnection as any });

      ingestWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
      digestWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));

      console.log('BullMQ Workers started successfully.');
      return;
    } catch (e) {
      console.error('Failed to start BullMQ Workers, starting local scheduler loops.');
    }
  }

  // Offline mock workers - Poll database every 5 minutes in background
  console.log('Offline mock workers started. Ingestion routines will run periodically.');
  
  // Ingest all sources every 5 minutes in background
  setInterval(async () => {
    try {
      const { db } = await import('./db');
      const sources = await db.source.findMany({ where: { isActive: true } });
      for (const src of sources) {
        await ingestSource(src.id);
      }
    } catch (e) {
      console.error('Offline ingestion loop error:', e);
    }
  }, 5 * 60 * 1000);
}
