import prisma from '../prisma/client';
import { Request } from 'express';

interface AuditLogOptions {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  req?: Request;
}

export class AuditService {
  public static async log({
    userId,
    action,
    entityType,
    entityId,
    details,
    req
  }: AuditLogOptions) {
    try {
      const ipAddress = req?.ip || req?.socket?.remoteAddress || 'unknown';
      const userAgent = req?.headers['user-agent'] || 'unknown';

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          entityType,
          entityId: entityId || null,
          ipAddress: typeof ipAddress === 'string' ? ipAddress : JSON.stringify(ipAddress),
          userAgent: typeof userAgent === 'string' ? userAgent : JSON.stringify(userAgent),
          details: details ? JSON.stringify(details) : null,
        }
      });
    } catch (err) {
      console.error('AuditLog writing failed:', err);
    }
  }
}
