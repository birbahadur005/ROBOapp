import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';
import { config } from '../config';
import { realTimeService } from '../services/realTimeService';

export class AdminController {
  /**
   * Initial setup status check
   */
  public static async getSetupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.applicationSettings.findUnique({ where: { id: 'default' } });
      const userCount = await prisma.user.count();

      res.json({
        success: true,
        isSetupComplete: settings?.isSetupComplete ?? (userCount > 0),
        settings: settings || {
          collegeName: config.defaultCollegeName,
          tagline: config.defaultTagline,
          defaultLanguage: config.defaultLanguage
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Initial Setup Wizard
   */
  public static async completeSetupWizard(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        adminAccountId,
        adminEmail,
        adminPassword,
        collegeName,
        tagline,
        defaultLanguage,
        departments,
        initialAuthorities
      } = req.body;

      // Hash password
      const passwordHash = await bcrypt.hash(adminPassword || 'Admin@123', 10);

      // Upsert Super Admin User
      const adminUser = await prisma.user.upsert({
        where: { email: adminEmail || 'admin@college.edu' },
        update: {
          accountId: adminAccountId || 'ADMIN-001',
          passwordHash,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE'
        },
        create: {
          accountId: adminAccountId || 'ADMIN-001',
          email: adminEmail || 'admin@college.edu',
          passwordHash,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE'
        }
      });

      // Upsert Application Settings
      await prisma.applicationSettings.upsert({
        where: { id: 'default' },
        update: {
          collegeName: collegeName || config.defaultCollegeName,
          tagline: tagline || config.defaultTagline,
          defaultLanguage: defaultLanguage || 'en',
          isSetupComplete: true
        },
        create: {
          id: 'default',
          collegeName: collegeName || config.defaultCollegeName,
          tagline: tagline || config.defaultTagline,
          defaultLanguage: defaultLanguage || 'en',
          isSetupComplete: true
        }
      });

      // Insert Initial Departments if provided
      if (Array.isArray(departments)) {
        for (const dep of departments) {
          await prisma.department.upsert({
            where: { code: dep.code },
            update: { name: dep.name, officeLocation: dep.officeLocation },
            create: {
              name: dep.name,
              code: dep.code,
              description: dep.description,
              officeLocation: dep.officeLocation
            }
          });
        }
      }

      await AuditService.log({
        userId: adminUser.id,
        action: 'SETUP_WIZARD_COMPLETED',
        entityType: 'SETTINGS',
        details: { collegeName }
      });

      res.json({ success: true, message: 'Setup wizard completed successfully!' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Settings
   */
  public static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      let settings = await prisma.applicationSettings.findUnique({ where: { id: 'default' } });
      if (!settings) {
        settings = await prisma.applicationSettings.create({
          data: {
            id: 'default',
            collegeName: config.defaultCollegeName,
            tagline: config.defaultTagline,
            defaultLanguage: config.defaultLanguage
          }
        });
      }
      res.json({ success: true, settings });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update Settings
   */
  public static async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = req.user!;

      const updated = await prisma.applicationSettings.upsert({
        where: { id: 'default' },
        update: {
          // Site & App Settings
          ...(data.siteName !== undefined ? { siteName: data.siteName, collegeName: data.siteName } : {}),
          ...(data.siteLogoUrl !== undefined ? { siteLogoUrl: data.siteLogoUrl, logoUrl: data.siteLogoUrl } : {}),
          ...(data.appName !== undefined ? { appName: data.appName } : {}),
          ...(data.appShortName !== undefined ? { appShortName: data.appShortName } : {}),
          ...(data.appLogoUrl !== undefined ? { appLogoUrl: data.appLogoUrl } : {}),

          // Compatibility fields
          ...(data.collegeName !== undefined && data.siteName === undefined ? { collegeName: data.collegeName, siteName: data.collegeName } : {}),
          ...(data.logoUrl !== undefined && data.siteLogoUrl === undefined ? { logoUrl: data.logoUrl, siteLogoUrl: data.logoUrl } : {}),
          ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
          ...(data.themeColor !== undefined ? { themeColor: data.themeColor } : {}),
          ...(typeof data.darkModeDefault === 'boolean' ? { darkModeDefault: data.darkModeDefault } : {}),
          
          ...(data.collegeEmail !== undefined ? { collegeEmail: data.collegeEmail } : {}),
          ...(data.collegePhone !== undefined ? { collegePhone: data.collegePhone } : {}),
          ...(data.emergencyPhone !== undefined ? { emergencyPhone: data.emergencyPhone } : {}),
          ...(data.collegeAddress !== undefined ? { collegeAddress: data.collegeAddress } : {}),
          ...(data.visitingHoursGeneral !== undefined ? { visitingHoursGeneral: data.visitingHoursGeneral } : {}),

          ...(data.defaultLanguage !== undefined ? { defaultLanguage: data.defaultLanguage } : {}),
          ...(typeof data.allowLanguageToggle === 'boolean' ? { allowLanguageToggle: data.allowLanguageToggle } : {}),

          ...(typeof data.allowCameraPhoto === 'boolean' ? { allowCameraPhoto: data.allowCameraPhoto } : {}),
          ...(typeof data.requireVisitorPhoto === 'boolean' ? { requireVisitorPhoto: data.requireVisitorPhoto } : {}),
          ...(data.requiredVisitorFields ? { requiredVisitorFields: typeof data.requiredVisitorFields === 'string' ? data.requiredVisitorFields : JSON.stringify(data.requiredVisitorFields) } : {}),
          ...(data.photoSourceMode !== undefined ? { photoSourceMode: data.photoSourceMode } : {}),

          ...(data.maxAdvanceBookingDays !== undefined ? { maxAdvanceBookingDays: Number(data.maxAdvanceBookingDays) } : {}),
          ...(data.appointmentLeadTimeHours !== undefined ? { appointmentLeadTimeHours: Number(data.appointmentLeadTimeHours) } : {}),
          ...(data.defaultSlotMinutes !== undefined ? { defaultSlotMinutes: Number(data.defaultSlotMinutes) } : {}),
          ...(typeof data.allowWeekendAppointments === 'boolean' ? { allowWeekendAppointments: data.allowWeekendAppointments } : {}),
          ...(typeof data.strictConflictPrevention === 'boolean' ? { strictConflictPrevention: data.strictConflictPrevention } : {}),
          ...(data.maxVisitorsPerRequest !== undefined ? { maxVisitorsPerRequest: Number(data.maxVisitorsPerRequest) } : {}),

          ...(typeof data.soundAlertsEnabled === 'boolean' ? { soundAlertsEnabled: data.soundAlertsEnabled } : {}),
          ...(typeof data.browserNotificationsEnabled === 'boolean' ? { browserNotificationsEnabled: data.browserNotificationsEnabled } : {}),
          ...(typeof data.emailNotificationsEnabled === 'boolean' ? { emailNotificationsEnabled: data.emailNotificationsEnabled } : {}),
          ...(data.smtpHost !== undefined ? { smtpHost: data.smtpHost } : {}),
          ...(data.smtpPort !== undefined ? { smtpPort: Number(data.smtpPort) } : {}),
          ...(data.smtpUser !== undefined ? { smtpUser: data.smtpUser } : {}),
          ...(data.smtpPass !== undefined ? { smtpPass: data.smtpPass } : {}),
          ...(data.smtpFrom !== undefined ? { smtpFrom: data.smtpFrom } : {}),

          ...(typeof data.enableAIAssistant === 'boolean' ? { enableAIAssistant: data.enableAIAssistant } : {}),
          ...(data.aiWelcomeMessage !== undefined ? { aiWelcomeMessage: data.aiWelcomeMessage } : {}),
          ...(data.aiCustomInstructions !== undefined ? { aiCustomInstructions: data.aiCustomInstructions } : {}),

          ...(data.kioskAutoResetSeconds !== undefined ? { kioskAutoResetSeconds: Number(data.kioskAutoResetSeconds) } : {}),
          ...(typeof data.kioskShowAnnouncements === 'boolean' ? { kioskShowAnnouncements: data.kioskShowAnnouncements } : {}),
          ...(typeof data.kioskShowCampusMap === 'boolean' ? { kioskShowCampusMap: data.kioskShowCampusMap } : {})
        },
        create: {
          id: 'default',
          siteName: data.siteName || data.collegeName || config.defaultCollegeName,
          siteLogoUrl: data.siteLogoUrl || data.logoUrl || null,
          appName: data.appName || data.collegeName || config.defaultCollegeName,
          appShortName: data.appShortName || 'Reception',
          appLogoUrl: data.appLogoUrl || null,
          collegeName: data.collegeName || data.siteName || config.defaultCollegeName,
          tagline: data.tagline || config.defaultTagline,
          requiredVisitorFields: JSON.stringify(data.requiredVisitorFields || ["visitorName", "visitorMobile", "purpose", "requestedDate", "requestedTime"])
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        details: data,
        req
      });

      realTimeService.broadcast('SETTINGS_UPDATED', updated);

      res.json({ success: true, message: 'Settings updated successfully.', settings: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Upload logo image (Site logo or App logo)
   */
  public static async uploadLogo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      const dataUri = req.body?.dataUri;

      if (!file && !dataUri) {
        return res.status(400).json({ success: false, message: 'No image file or data URI provided.' });
      }

      const logosDir = path.resolve(config.storageUploadDir, '../logos');
      if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir, { recursive: true });
      }

      let filename = '';
      if (file) {
        const ext = path.extname(file.originalname).toLowerCase() || '.png';
        filename = `logo-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`;
        fs.writeFileSync(path.join(logosDir, filename), file.buffer);
      } else if (dataUri) {
        const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ success: false, message: 'Invalid data URI image format.' });
        }
        const mimeType = matches[1];
        const ext = mimeType.includes('svg') ? '.svg' : mimeType.includes('jpeg') ? '.jpg' : mimeType.includes('webp') ? '.webp' : '.png';
        filename = `logo-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`;
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(path.join(logosDir, filename), buffer);
      }

      const logoUrl = `/uploads/logos/${filename}`;
      res.json({ success: true, logoUrl, message: 'Logo uploaded successfully.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Manage Departments (List, Create, Update, Delete)
   */
  public static async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await prisma.department.findMany({
        include: { _count: { select: { authorities: true } } },
        orderBy: { name: 'asc' }
      });
      res.json({ success: true, departments });
    } catch (err) {
      next(err);
    }
  }

  public static async createDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, description, headName, officeLocation, contactEmail, contactPhone } = req.body;
      const user = req.user!;

      const department = await prisma.department.create({
        data: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description?.trim() || null,
          headName: headName?.trim() || null,
          officeLocation: officeLocation?.trim() || null,
          contactEmail: contactEmail?.trim() || null,
          contactPhone: contactPhone?.trim() || null
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'CREATE_DEPARTMENT',
        entityType: 'DEPARTMENT',
        entityId: department.id,
        details: { name, code },
        req
      });

      res.status(201).json({ success: true, department });
    } catch (err) {
      next(err);
    }
  }

  public static async updateDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const user = req.user!;

      const department = await prisma.department.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.headName !== undefined ? { headName: data.headName } : {}),
          ...(data.officeLocation !== undefined ? { officeLocation: data.officeLocation } : {}),
          ...(data.contactEmail !== undefined ? { contactEmail: data.contactEmail } : {}),
          ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {})
        }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_DEPARTMENT',
        entityType: 'DEPARTMENT',
        entityId: id,
        details: data,
        req
      });

      res.json({ success: true, department });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user!;

      await prisma.department.delete({ where: { id } });

      await AuditService.log({
        userId: user.id,
        action: 'DELETE_DEPARTMENT',
        entityType: 'DEPARTMENT',
        entityId: id,
        req
      });

      res.json({ success: true, message: 'Department deleted.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Manage Authorities (Create with account, Update, Disable)
   */
  public static async createAuthority(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        accountId,
        email,
        password,
        name,
        designation,
        departmentId,
        officeLocation,
        visitingHours,
        bio,
        mobile
      } = req.body;
      const user = req.user!;

      const passwordHash = await bcrypt.hash(password || 'Authority@123', 10);

      // Create User first
      const newUser = await prisma.user.create({
        data: {
          accountId: accountId.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          passwordHash,
          role: 'AUTHORITY',
          status: 'ACTIVE'
        }
      });

      const defaultSchedule = visitingHours ? (typeof visitingHours === 'string' ? visitingHours : JSON.stringify(visitingHours)) : JSON.stringify({
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '10:00',
        endTime: '16:00',
        slotMinutes: 15
      });

      const authority = await prisma.authority.create({
        data: {
          userId: newUser.id,
          name: name.trim(),
          designation: designation.trim(),
          departmentId,
          officeLocation: officeLocation.trim(),
          visitingHours: defaultSchedule,
          bio: bio || null,
          email: email.trim().toLowerCase(),
          mobile: mobile || null
        },
        include: { department: true, user: true }
      });

      await AuditService.log({
        userId: user.id,
        action: 'CREATE_AUTHORITY',
        entityType: 'AUTHORITY',
        entityId: authority.id,
        details: { accountId, name, designation },
        req
      });

      res.status(201).json({ success: true, authority });
    } catch (err) {
      next(err);
    }
  }

  public static async updateAuthority(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const user = req.user!;

      const updated = await prisma.authority.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.designation ? { designation: data.designation } : {}),
          ...(data.departmentId ? { departmentId: data.departmentId } : {}),
          ...(data.officeLocation ? { officeLocation: data.officeLocation } : {}),
          ...(data.visitingHours ? { visitingHours: typeof data.visitingHours === 'string' ? data.visitingHours : JSON.stringify(data.visitingHours) } : {}),
          ...(typeof data.isAcceptingAppointments === 'boolean' ? { isAcceptingAppointments: data.isAcceptingAppointments } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {})
        },
        include: { department: true, user: true }
      });

      await AuditService.log({
        userId: user.id,
        action: 'UPDATE_AUTHORITY',
        entityType: 'AUTHORITY',
        entityId: id,
        details: data,
        req
      });

      res.json({ success: true, authority: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const { status } = req.body; // ACTIVE or DISABLED
      const adminUser = req.user!;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { status }
      });

      await AuditService.log({
        userId: adminUser.id,
        action: status === 'ACTIVE' ? 'ACTIVATE_USER' : 'DISABLE_USER',
        entityType: 'USER',
        entityId: userId,
        req
      });

      res.json({ success: true, user: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Analytics
   */
  public static async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        acceptedAppointments,
        rejectedAppointments,
        rescheduledAppointments,
        completedAppointments,
        authoritiesCount,
        departmentsCount
      ] = await Promise.all([
        prisma.appointment.count(),
        prisma.appointment.count({
          where: {
            OR: [
              { requestedDate: today },
              { scheduledDate: today }
            ]
          }
        }),
        prisma.appointment.count({ where: { status: 'PENDING' } }),
        prisma.appointment.count({ where: { status: 'ACCEPTED' } }),
        prisma.appointment.count({ where: { status: 'REJECTED' } }),
        prisma.appointment.count({ where: { status: 'RESCHEDULED' } }),
        prisma.appointment.count({ where: { status: 'COMPLETED' } }),
        prisma.authority.count(),
        prisma.department.count()
      ]);

      // Department breakdown
      const departments = await prisma.department.findMany({
        include: {
          authorities: {
            include: {
              _count: { select: { appointments: true } }
            }
          }
        }
      });

      const departmentBreakdown = departments.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        appointmentCount: d.authorities.reduce((sum, a) => sum + a._count.appointments, 0)
      }));

      res.json({
        success: true,
        analytics: {
          totalAppointments,
          todayAppointments,
          pendingAppointments,
          acceptedAppointments,
          rejectedAppointments,
          rescheduledAppointments,
          completedAppointments,
          authoritiesCount,
          departmentsCount,
          departmentBreakdown
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Audit Logs
   */
  public static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { limit = '50', page = '1' } = req.query;
      const take = parseInt(String(limit), 10);
      const skip = (parseInt(String(page), 10) - 1) * take;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          take,
          skip,
          orderBy: { timestamp: 'desc' },
          include: { user: { select: { accountId: true, role: true, email: true } } }
        }),
        prisma.auditLog.count()
      ]);

      res.json({ success: true, logs, total, page: parseInt(String(page), 10) });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Export Appointments CSV (Privacy conscious)
   */
  public static async exportAppointmentsCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await prisma.appointment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { authority: { include: { department: true } } }
      });

      // Format CSV
      const headers = ['Reference No', 'Status', 'Visitor Name', 'Authority', 'Department', 'Requested Date', 'Requested Time', 'Scheduled Date', 'Scheduled Time', 'Duration (Mins)', 'Created At'];
      const rows = appointments.map(a => [
        a.referenceNo,
        a.status,
        `"${a.visitorName.replace(/"/g, '""')}"`,
        `"${a.authority.name.replace(/"/g, '""')}"`,
        `"${a.authority.department.name.replace(/"/g, '""')}"`,
        a.requestedDate,
        a.requestedTime,
        a.scheduledDate || '',
        a.scheduledTime || '',
        a.durationMinutes,
        a.createdAt.toISOString()
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=appointments-export-${Date.now()}.csv`);
      res.send(csvContent);
    } catch (err) {
      next(err);
    }
  }
}
