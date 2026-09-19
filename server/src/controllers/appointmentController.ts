import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import path from 'path';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ConflictService } from '../services/conflictService';
import { QRService } from '../services/qrService';
import { PhotoStorageService } from '../services/photoStorageService';
import { realTimeService } from '../services/realTimeService';
import { AuditService } from '../services/auditService';
import { config } from '../config';

const createAppointmentSchema = z.object({
  authorityId: z.string().min(1, 'Authority selection is required'),
  visitorName: z.string().min(2, 'Visitor name is required'),
  visitorMobile: z.string().min(10, 'Valid mobile number is required'),
  visitorEmail: z.string().email().optional().or(z.literal('')),
  studentId: z.string().optional().or(z.literal('')),
  departmentName: z.string().optional().or(z.literal('')),
  organization: z.string().optional().or(z.literal('')),
  purpose: z.string().min(3, 'Purpose of visit is required'),
  message: z.string().optional().or(z.literal('')),
  numberOfVisitors: z.number().min(1).default(1),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD required'),
  requestedTime: z.string().regex(/^\d{2}:\d{2}$/, 'Valid time HH:MM required'),
  photoBase64: z.string().optional()
});

export class AppointmentController {
  /**
   * Generates next sequential reference number: RAVAN-2026-000001
   */
  private static async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    let count = await prisma.appointment.count();
    let candidate = '';
    let exists = true;
    while (exists) {
      count++;
      candidate = `RAVAN-${year}-${String(count).padStart(6, '0')}`;
      const found = await prisma.appointment.findUnique({ where: { referenceNo: candidate } });
      if (!found) {
        exists = false;
      }
    }
    return candidate;
  }

  /**
   * Visitor creates a new appointment request (Public Endpoint)
   */
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAppointmentSchema.parse(req.body);

      // Verify authority exists and accepts appointments
      const authority = await prisma.authority.findUnique({
        where: { id: data.authorityId },
        include: { user: true, department: true }
      });

      if (!authority || authority.user.status !== 'ACTIVE') {
        return res.status(404).json({ success: false, message: 'Selected authority is not available.' });
      }

      // Check application settings
      const settings = await prisma.applicationSettings.findUnique({ where: { id: 'default' } });

      // 1. Photo requirements
      if (settings?.requireVisitorPhoto && !data.photoBase64) {
        return res.status(400).json({ success: false, message: 'Visitor photo is required by college policy.' });
      }

      // 2. Max visitors per request
      if (settings?.maxVisitorsPerRequest && data.numberOfVisitors > settings.maxVisitorsPerRequest) {
        return res.status(400).json({
          success: false,
          message: `Number of visitors cannot exceed ${settings.maxVisitorsPerRequest}.`
        });
      }

      // 3. Max advance booking days
      if (settings?.maxAdvanceBookingDays) {
        const reqDate = new Date(data.requestedDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((reqDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > settings.maxAdvanceBookingDays) {
          return res.status(400).json({
            success: false,
            message: `Appointments can only be booked up to ${settings.maxAdvanceBookingDays} days in advance.`
          });
        }
      }

      // 4. Weekend appointment restriction
      if (settings?.allowWeekendAppointments === false) {
        const reqDate = new Date(data.requestedDate + 'T00:00:00');
        const dayOfWeek = reqDate.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return res.status(400).json({
            success: false,
            message: 'Weekend appointments are not permitted by college schedule policy.'
          });
        }
      }

      // 5. Dynamic required visitor fields
      if (settings?.requiredVisitorFields) {
        let reqFields: string[] = [];
        try {
          reqFields = typeof settings.requiredVisitorFields === 'string'
            ? JSON.parse(settings.requiredVisitorFields)
            : (settings.requiredVisitorFields as any);
        } catch (e) {}

        if (Array.isArray(reqFields)) {
          for (const field of reqFields) {
            if (field === 'visitorEmail' && !data.visitorEmail) {
              return res.status(400).json({ success: false, message: 'Visitor email is required.' });
            }
            if (field === 'studentId' && !data.studentId) {
              return res.status(400).json({ success: false, message: 'Student / Staff ID is required.' });
            }
            if (field === 'departmentName' && !data.departmentName) {
              return res.status(400).json({ success: false, message: 'Department name is required.' });
            }
            if (field === 'organization' && !data.organization) {
              return res.status(400).json({ success: false, message: 'Organization name is required.' });
            }
            if (field === 'message' && !data.message) {
              return res.status(400).json({ success: false, message: 'Additional message is required.' });
            }
          }
        }
      }

      // Handle optional visitor photo storage
      let visitorPhotoId: string | undefined;
      if (data.photoBase64) {
        try {
          const photoMeta = await PhotoStorageService.savePhoto(data.photoBase64);
          const savedPhoto = await prisma.visitorPhoto.create({
            data: photoMeta
          });
          visitorPhotoId = savedPhoto.id;
        } catch (photoErr: any) {
          return res.status(400).json({ success: false, message: photoErr.message || 'Failed to process visitor photo.' });
        }
      }

      const referenceNo = await AppointmentController.generateReferenceNumber();

      const appointment = await prisma.appointment.create({
        data: {
          referenceNo,
          authorityId: data.authorityId,
          visitorName: data.visitorName.trim(),
          visitorMobile: data.visitorMobile.trim(),
          visitorEmail: data.visitorEmail ? data.visitorEmail.trim().toLowerCase() : null,
          studentId: data.studentId ? data.studentId.trim() : null,
          departmentName: data.departmentName ? data.departmentName.trim() : null,
          organization: data.organization ? data.organization.trim() : null,
          purpose: data.purpose.trim(),
          message: data.message ? data.message.trim() : null,
          numberOfVisitors: data.numberOfVisitors,
          requestedDate: data.requestedDate,
          requestedTime: data.requestedTime,
          status: 'PENDING',
          visitorPhotoId: visitorPhotoId || null,
          history: {
            create: {
              fromStatus: 'NONE',
              toStatus: 'PENDING',
              reason: 'Initial appointment booking request by visitor'
            }
          }
        },
        include: {
          authority: {
            include: { department: true }
          }
        }
      });

      await AuditService.log({
        action: 'CREATE_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: appointment.id,
        details: { referenceNo: appointment.referenceNo, authorityId: authority.id },
        req
      });

      // Real-time broadcast to authority and reception
      realTimeService.notifyNewAppointment(appointment);

      res.status(201).json({
        success: true,
        message: 'Appointment request submitted successfully.',
        appointment: {
          id: appointment.id,
          referenceNo: appointment.referenceNo,
          status: appointment.status,
          requestedDate: appointment.requestedDate,
          requestedTime: appointment.requestedTime,
          authorityName: authority.name,
          designation: authority.designation,
          department: authority.department.name
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Visitor tracks appointment using Reference No + Mobile Number (Public Endpoint)
   */
  public static async trackStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { referenceNo, mobile } = req.query;

      if (!referenceNo || !mobile) {
        return res.status(400).json({
          success: false,
          message: 'Both Appointment Reference Number and Mobile Number are required for verification.'
        });
      }

      const appointment = await prisma.appointment.findFirst({
        where: {
          referenceNo: String(referenceNo).trim(),
          visitorMobile: String(mobile).trim()
        },
        include: {
          authority: {
            include: { department: true }
          }
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'No appointment found matching the provided reference number and mobile number.'
        });
      }

      let qrDataUrl: string | null = null;
      if (appointment.status === 'ACCEPTED' && appointment.qrToken) {
        qrDataUrl = await QRService.generateQRCodeDataUrl(appointment.qrToken);
      }

      res.json({
        success: true,
        appointment: {
          id: appointment.id,
          referenceNo: appointment.referenceNo,
          status: appointment.status,
          visitorName: appointment.visitorName,
          authorityName: appointment.authority.name,
          designation: appointment.authority.designation,
          department: appointment.authority.department.name,
          officeLocation: appointment.authority.officeLocation,
          requestedDate: appointment.requestedDate,
          requestedTime: appointment.requestedTime,
          scheduledDate: appointment.scheduledDate,
          scheduledTime: appointment.scheduledTime,
          durationMinutes: appointment.durationMinutes,
          location: appointment.location,
          authorityMessage: appointment.authorityMessage,
          qrDataUrl,
          createdAt: appointment.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List appointments (Role-based access)
   */
  public static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, date, search } = req.query;
      const user = req.user!;

      const where: any = {};

      // Role isolation: Authority only sees their appointments
      if (user.role === 'AUTHORITY') {
        if (!user.authorityId) {
          return res.status(403).json({ success: false, message: 'Authority profile not linked' });
        }
        where.authorityId = user.authorityId;
      }

      if (status && status !== 'ALL') {
        where.status = String(status);
      }

      if (date) {
        where.OR = [
          { requestedDate: String(date) },
          { scheduledDate: String(date) }
        ];
      }

      if (search) {
        const query = String(search).toLowerCase();
        where.OR = [
          { referenceNo: { contains: query } },
          { visitorName: { contains: query } },
          { visitorMobile: { contains: query } },
          { purpose: { contains: query } }
        ];
      }

      const appointments = await prisma.appointment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          authority: {
            include: { department: true }
          },
          visitorPhoto: {
            select: { id: true, mimeType: true, fileSize: true }
          }
        }
      });

      res.json({ success: true, count: appointments.length, appointments });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single appointment details
   */
  public static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user!;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          authority: {
            include: { department: true }
          },
          visitorPhoto: true,
          history: {
            orderBy: { timestamp: 'desc' },
            include: { changedByUser: { select: { accountId: true, role: true } } }
          }
        }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Check authorization
      if (user.role === 'AUTHORITY' && appointment.authorityId !== user.authorityId) {
        return res.status(403).json({ success: false, message: 'Access denied to this appointment.' });
      }

      let photoSignedUrl: string | null = null;
      if (appointment.visitorPhotoId) {
        const token = PhotoStorageService.generateSignedPhotoToken(appointment.visitorPhotoId, user.id);
        photoSignedUrl = `/api/appointments/photos/${appointment.visitorPhotoId}?token=${token}`;
      }

      let qrDataUrl: string | null = null;
      if (appointment.qrToken) {
        qrDataUrl = await QRService.generateQRCodeDataUrl(appointment.qrToken);
      }

      res.json({
        success: true,
        appointment: {
          ...appointment,
          photoSignedUrl,
          qrDataUrl
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authority accepts an appointment request
   */
  public static async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { scheduledDate, scheduledTime, durationMinutes, location, authorityMessage, internalNotes } = req.body;
      const user = req.user!;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { authority: true }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (user.role === 'AUTHORITY' && appointment.authorityId !== user.authorityId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment' });
      }

      const dateToSchedule = scheduledDate || appointment.requestedDate;
      const timeToSchedule = scheduledTime || appointment.requestedTime;
      const duration = parseInt(durationMinutes || '15', 10);
      const meetingLocation = location || appointment.authority.officeLocation;

      // Double booking / conflict check
      const conflict = await ConflictService.checkConflict({
        authorityId: appointment.authorityId,
        scheduledDate: dateToSchedule,
        scheduledTime: timeToSchedule,
        durationMinutes: duration,
        excludeAppointmentId: appointment.id
      });

      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflict.reason,
          conflictDetails: conflict.conflictingAppointment
        });
      }

      // Generate secure QR Token
      const qrToken = QRService.generateToken(appointment.referenceNo, appointment.id);

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          scheduledDate: dateToSchedule,
          scheduledTime: timeToSchedule,
          durationMinutes: duration,
          location: meetingLocation,
          authorityMessage: authorityMessage || 'Your appointment has been accepted. Please arrive 10 minutes prior.',
          internalNotes: internalNotes || appointment.internalNotes,
          qrToken,
          history: {
            create: {
              fromStatus: appointment.status,
              toStatus: 'ACCEPTED',
              changedByUserId: user.id,
              reason: authorityMessage || 'Appointment accepted by authority'
            }
          }
        },
        include: { authority: { include: { department: true } } }
      });

      await AuditService.log({
        userId: user.id,
        action: 'ACCEPT_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: appointment.id,
        details: { referenceNo: appointment.referenceNo, scheduledDate: dateToSchedule, scheduledTime: timeToSchedule },
        req
      });

      realTimeService.notifyAppointmentUpdate(appointment.referenceNo, updated);

      res.json({
        success: true,
        message: 'Appointment accepted successfully.',
        appointment: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authority rejects an appointment
   */
  public static async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason, internalNotes } = req.body;
      const user = req.user!;

      const appointment = await prisma.appointment.findUnique({ where: { id } });
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (user.role === 'AUTHORITY' && appointment.authorityId !== user.authorityId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const visitorMessage = reason || 'Currently unavailable. Please contact the office for another appointment.';

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: 'REJECTED',
          authorityMessage: visitorMessage,
          internalNotes: internalNotes || appointment.internalNotes,
          history: {
            create: {
              fromStatus: appointment.status,
              toStatus: 'REJECTED',
              changedByUserId: user.id,
              reason: visitorMessage
            }
          }
        },
        include: { authority: { include: { department: true } } }
      });

      await AuditService.log({
        userId: user.id,
        action: 'REJECT_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: appointment.id,
        details: { referenceNo: appointment.referenceNo, reason: visitorMessage },
        req
      });

      realTimeService.notifyAppointmentUpdate(appointment.referenceNo, updated);

      res.json({ success: true, message: 'Appointment rejected.', appointment: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authority reschedules an appointment
   */
  public static async reschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { newDate, newTime, durationMinutes, location, message, internalNotes } = req.body;
      const user = req.user!;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { authority: true }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (user.role === 'AUTHORITY' && appointment.authorityId !== user.authorityId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const duration = parseInt(durationMinutes || '15', 10);

      // Check conflict for new time slot
      const conflict = await ConflictService.checkConflict({
        authorityId: appointment.authorityId,
        scheduledDate: newDate,
        scheduledTime: newTime,
        durationMinutes: duration,
        excludeAppointmentId: appointment.id
      });

      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflict.reason,
          conflictDetails: conflict.conflictingAppointment
        });
      }

      const qrToken = appointment.qrToken || QRService.generateToken(appointment.referenceNo, appointment.id);

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: 'RESCHEDULED',
          scheduledDate: newDate,
          scheduledTime: newTime,
          durationMinutes: duration,
          location: location || appointment.location || appointment.authority.officeLocation,
          authorityMessage: message || 'Your appointment has been rescheduled to a new date/time.',
          internalNotes: internalNotes || appointment.internalNotes,
          qrToken,
          history: {
            create: {
              fromStatus: appointment.status,
              toStatus: 'RESCHEDULED',
              changedByUserId: user.id,
              reason: message || `Rescheduled to ${newDate} at ${newTime}`
            }
          }
        },
        include: { authority: { include: { department: true } } }
      });

      await AuditService.log({
        userId: user.id,
        action: 'RESCHEDULE_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: appointment.id,
        details: { referenceNo: appointment.referenceNo, newDate, newTime },
        req
      });

      realTimeService.notifyAppointmentUpdate(appointment.referenceNo, updated);

      res.json({ success: true, message: 'Appointment rescheduled successfully.', appointment: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark appointment COMPLETED (Reception or Authority)
   */
  public static async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user!;

      const appointment = await prisma.appointment.findUnique({ where: { id } });
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          history: {
            create: {
              fromStatus: appointment.status,
              toStatus: 'COMPLETED',
              changedByUserId: user.id,
              reason: 'Marked completed after visit'
            }
          }
        },
        include: { authority: { include: { department: true } } }
      });

      await AuditService.log({
        userId: user.id,
        action: 'COMPLETE_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: appointment.id,
        req
      });

      realTimeService.notifyAppointmentUpdate(appointment.referenceNo, updated);

      res.json({ success: true, message: 'Appointment marked as completed.', appointment: updated });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Serve private photo with signed token or authenticated session
   */
  public static async streamPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const photoId = req.params.photoId as string;
      const { token } = req.query;

      // Verify token
      if (!token) {
        return res.status(403).json({ success: false, message: 'Access token required to view private visitor photo.' });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(String(token), config.jwtSecret);
      } catch (e) {
        return res.status(403).json({ success: false, message: 'Invalid or expired photo view token.' });
      }

      if (decoded.photoId !== photoId) {
        return res.status(403).json({ success: false, message: 'Photo token mismatch.' });
      }

      const photo = await prisma.visitorPhoto.findUnique({ where: { id: photoId } });
      if (!photo) {
        return res.status(404).json({ success: false, message: 'Photo not found.' });
      }

      const filePath = PhotoStorageService.getPhotoFilePath(photo.filePath);
      if (!filePath) {
        return res.status(404).json({ success: false, message: 'Photo file missing on disk.' });
      }

      res.setHeader('Content-Type', photo.mimeType);
      res.setHeader('Cache-Control', 'private, max-age=1800');
      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Verify QR Pass token (Used by Reception Desk)
   */
  public static async verifyQR(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { qrToken } = req.body;
      if (!qrToken) {
        return res.status(400).json({ success: false, message: 'QR token is required.' });
      }

      const appointment = await prisma.appointment.findFirst({
        where: { qrToken },
        include: {
          authority: { include: { department: true } },
          visitorPhoto: true
        }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Invalid or unrecognized visitor pass QR code.' });
      }

      let photoSignedUrl: string | null = null;
      if (appointment.visitorPhotoId && req.user) {
        const token = PhotoStorageService.generateSignedPhotoToken(appointment.visitorPhotoId, req.user.id);
        photoSignedUrl = `/api/appointments/photos/${appointment.visitorPhotoId}?token=${token}`;
      }

      res.json({
        success: true,
        valid: true,
        appointment: {
          ...appointment,
          photoSignedUrl
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
