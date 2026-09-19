import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';
import { realTimeService } from '../services/realTimeService';

export class CollegeController {
  /**
   * List College Information items (Public / Visitor)
   */
  public static async listInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      const where: any = { isActive: true };

      if (category && category !== 'ALL') {
        where.category = String(category).toUpperCase();
      }

      const items = await prisma.collegeInformation.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { title: 'asc' }]
      });

      res.json({ success: true, items });
    } catch (err) {
      next(err);
    }
  }

  public static async createInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { category, title, contentEn, contentHi, priority } = req.body;
      const user = req.user!;

      const item = await prisma.collegeInformation.create({
        data: {
          category: category.toUpperCase(),
          title: title.trim(),
          contentEn: contentEn.trim(),
          contentHi: contentHi ? contentHi.trim() : contentEn.trim(),
          priority: priority ? parseInt(priority, 10) : 0
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'CREATE_COLLEGE_INFO',
        entityType: 'COLLEGE_INFO',
        entityId: item.id,
        details: { category, title },
        req
      });

      res.status(201).json({ success: true, item });
    } catch (err) {
      next(err);
    }
  }

  public static async updateInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const user = req.user!;

      const item = await prisma.collegeInformation.update({
        where: { id },
        data: {
          ...(data.category ? { category: data.category.toUpperCase() } : {}),
          ...(data.title ? { title: data.title } : {}),
          ...(data.contentEn ? { contentEn: data.contentEn } : {}),
          ...(data.contentHi ? { contentHi: data.contentHi } : {}),
          ...(data.priority !== undefined ? { priority: Number(data.priority) } : {}),
          ...(typeof data.isActive === 'boolean' ? { isActive: data.isActive } : {})
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_COLLEGE_INFO',
        entityType: 'COLLEGE_INFO',
        entityId: id,
        details: data,
        req
      });

      res.json({ success: true, item });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user!;

      await prisma.collegeInformation.delete({ where: { id } });

      await AuditService.log({
        userId: user.id,
        action: 'DELETE_COLLEGE_INFO',
        entityType: 'COLLEGE_INFO',
        entityId: id,
        req
      });

      res.json({ success: true, message: 'Information item removed.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Campus Locations & Interactive Map
   */
  public static async listCampusLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await prisma.campusLocation.findMany({
        orderBy: { name: 'asc' }
      });
      res.json({ success: true, locations });
    } catch (err) {
      next(err);
    }
  }

  public static async createCampusLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, category, locationCode, description, xCoord, yCoord, floorInfo } = req.body;
      const user = req.user!;

      const location = await prisma.campusLocation.create({
        data: {
          name: name.trim(),
          category: category.toUpperCase(),
          locationCode: locationCode.trim().toUpperCase(),
          description: description?.trim() || null,
          xCoord: typeof xCoord === 'number' ? xCoord : parseFloat(xCoord || '50'),
          yCoord: typeof yCoord === 'number' ? yCoord : parseFloat(yCoord || '50'),
          floorInfo: floorInfo?.trim() || null
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'CREATE_CAMPUS_LOCATION',
        entityType: 'CAMPUS_LOCATION',
        entityId: location.id,
        details: { name, locationCode },
        req
      });

      res.status(201).json({ success: true, location });
    } catch (err) {
      next(err);
    }
  }

  public static async updateCampusLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const user = req.user!;

      const updated = await prisma.campusLocation.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.category ? { category: data.category.toUpperCase() } : {}),
          ...(data.locationCode ? { locationCode: data.locationCode.toUpperCase() } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.xCoord !== undefined ? { xCoord: parseFloat(data.xCoord) } : {}),
          ...(data.yCoord !== undefined ? { yCoord: parseFloat(data.yCoord) } : {}),
          ...(data.floorInfo !== undefined ? { floorInfo: data.floorInfo } : {})
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_CAMPUS_LOCATION',
        entityType: 'CAMPUS_LOCATION',
        entityId: id,
        details: data,
        req
      });

      res.json({ success: true, location: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteCampusLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user!;

      await prisma.campusLocation.delete({ where: { id } });

      await AuditService.log({
        userId: user.id,
        action: 'DELETE_CAMPUS_LOCATION',
        entityType: 'CAMPUS_LOCATION',
        entityId: id,
        req
      });

      res.json({ success: true, message: 'Campus location deleted.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Announcements & Notices
   */
  public static async listAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const announcements = await prisma.announcement.findMany({
        where: {
          isActive: true,
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: now } }
          ]
        },
        orderBy: { publishDate: 'desc' }
      });
      res.json({ success: true, announcements });
    } catch (err) {
      next(err);
    }
  }

  public static async createAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, priority, expiryDate } = req.body;
      const user = req.user!;

      const announcement = await prisma.announcement.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          priority: priority ? priority.toUpperCase() : 'NORMAL',
          expiryDate: expiryDate ? new Date(expiryDate) : null
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'CREATE_ANNOUNCEMENT',
        entityType: 'ANNOUNCEMENT',
        entityId: announcement.id,
        details: { title, priority },
        req
      });

      realTimeService.broadcast('NEW_ANNOUNCEMENT', announcement);

      res.status(201).json({ success: true, announcement });
    } catch (err) {
      next(err);
    }
  }

  public static async updateAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const user = req.user!;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          ...(data.title ? { title: data.title } : {}),
          ...(data.description ? { description: data.description } : {}),
          ...(data.priority ? { priority: data.priority.toUpperCase() } : {}),
          ...(data.expiryDate !== undefined ? { expiryDate: data.expiryDate ? new Date(data.expiryDate) : null } : {}),
          ...(typeof data.isActive === 'boolean' ? { isActive: data.isActive } : {})
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_ANNOUNCEMENT',
        entityType: 'ANNOUNCEMENT',
        entityId: id,
        details: data,
        req
      });

      realTimeService.broadcast('ANNOUNCEMENT_UPDATED', announcement);

      res.json({ success: true, announcement });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user!;

      await prisma.announcement.delete({ where: { id } });

      await AuditService.log({
        userId: user.id,
        action: 'DELETE_ANNOUNCEMENT',
        entityType: 'ANNOUNCEMENT',
        entityId: id,
        req
      });

      res.json({ success: true, message: 'Announcement deleted.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Global Search (Authorities, Departments, Campus Locations, Announcements, Info)
   */
  public static async searchGlobal(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      if (!q || q.length < 2) {
        return res.json({ success: true, results: { authorities: [], departments: [], locations: [], info: [], announcements: [] } });
      }

      const [authorities, departments, locations, info, announcements] = await Promise.all([
        prisma.authority.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { designation: { contains: q } },
              { officeLocation: { contains: q } }
            ]
          },
          include: { department: true },
          take: 5
        }),
        prisma.department.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { code: { contains: q } },
              { description: { contains: q } }
            ]
          },
          take: 5
        }),
        prisma.campusLocation.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { locationCode: { contains: q } },
              { description: { contains: q } }
            ]
          },
          take: 5
        }),
        prisma.collegeInformation.findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: q } },
              { contentEn: { contains: q } },
              { contentHi: { contains: q } }
            ]
          },
          take: 5
        }),
        prisma.announcement.findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: q } },
              { description: { contains: q } }
            ]
          },
          take: 5
        })
      ]);

      res.json({
        success: true,
        results: {
          authorities,
          departments,
          locations,
          info,
          announcements
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
