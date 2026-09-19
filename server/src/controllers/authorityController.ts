import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

export class AuthorityController {
  /**
   * Public directory of authorities for visitor kiosk & booking
   */
  public static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.query;

      const where: any = {
        user: { status: 'ACTIVE' }
      };

      if (departmentId) {
        where.departmentId = String(departmentId);
      }

      const authorities = await prisma.authority.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true, code: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        count: authorities.length,
        authorities: authorities.map(a => ({
          id: a.id,
          name: a.name,
          designation: a.designation,
          department: a.department,
          officeLocation: a.officeLocation,
          visitingHours: a.visitingHours,
          profilePhotoUrl: a.profilePhotoUrl,
          isAcceptingAppointments: a.isAcceptingAppointments,
          bio: a.bio
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single authority profile
   */
  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const authority = await prisma.authority.findUnique({
        where: { id },
        include: { department: true }
      });

      if (!authority) {
        return res.status(404).json({ success: false, message: 'Authority not found.' });
      }

      res.json({ success: true, authority });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authority updates their own availability / hours
   */
  public static async updateSelfAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (!user.authorityId) {
        return res.status(403).json({ success: false, message: 'No linked authority profile.' });
      }

      const { isAcceptingAppointments, visitingHours, bio, officeLocation } = req.body;

      const updated = await prisma.authority.update({
        where: { id: user.authorityId },
        data: {
          ...(typeof isAcceptingAppointments === 'boolean' ? { isAcceptingAppointments } : {}),
          ...(visitingHours ? { visitingHours: JSON.stringify(visitingHours) } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(officeLocation ? { officeLocation } : {})
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_AUTHORITY_AVAILABILITY',
        entityType: 'AUTHORITY',
        entityId: user.authorityId,
        req
      });

      res.json({ success: true, message: 'Availability updated successfully.', authority: updated });
    } catch (err) {
      next(err);
    }
  }
}
