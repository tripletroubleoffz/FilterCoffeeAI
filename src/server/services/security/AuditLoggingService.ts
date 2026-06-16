import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface AuditLogOptions {
  userId?: string;
  action: string;
  details: string;
  ipAddress?: string;
  actor?: string;
  entity?: string;
  entityId?: string;
  beforeState?: Prisma.InputJsonValue;
  afterState?: Prisma.InputJsonValue;
}

export class AuditLoggingService {
  static async log(options: AuditLogOptions) {
    try {
      return await db.auditLog.create({
        data: {
          userId: options.userId || null,
          action: options.action,
          details: options.details,
          ipAddress: options.ipAddress || null,
          actor: options.actor || null,
          entity: options.entity || null,
          entityId: options.entityId || null,
          beforeState: options.beforeState !== undefined ? (typeof options.beforeState === 'string' ? JSON.parse(options.beforeState) : options.beforeState) : null,
          afterState: options.afterState !== undefined ? (typeof options.afterState === 'string' ? JSON.parse(options.afterState) : options.afterState) : null,
        },
      });
    } catch (err) {
      console.error('[AuditLogging] Failed to log audit event:', err);
    }
  }
}
