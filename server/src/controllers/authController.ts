import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma/client';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Account ID or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = loginSchema.parse(req.body);
      const trimmed = identifier.trim();

      // Support login by either unique accountId (case-insensitive) or email (case-insensitive)
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { accountId: trimmed },
            { accountId: trimmed.toUpperCase() },
            { email: trimmed.toLowerCase() },
            { email: trimmed }
          ]
        },
        include: {
          authorityProfile: {
            include: { department: true }
          }
        }
      });

      if (!user) {
        await AuditService.log({
          action: 'FAILED_LOGIN',
          entityType: 'USER',
          details: { identifier, reason: 'User not found' },
          req
        });
        return res.status(401).json({ success: false, message: 'Invalid Account ID/Email or password.' });
      }

      if (user.status !== 'ACTIVE') {
        await AuditService.log({
          userId: user.id,
          action: 'LOGIN_BLOCKED',
          entityType: 'USER',
          details: { reason: 'Account disabled' },
          req
        });
        return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the administrator.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        await AuditService.log({
          userId: user.id,
          action: 'FAILED_LOGIN',
          entityType: 'USER',
          details: { reason: 'Incorrect password' },
          req
        });
        return res.status(401).json({ success: false, message: 'Invalid Account ID/Email or password.' });
      }

      const token = jwt.sign(
        { userId: user.id, accountId: user.accountId, role: user.role },
        config.jwtSecret,
        { expiresIn: '12h' }
      );

      // Set secure HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
      });

      await AuditService.log({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        req
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          accountId: user.accountId,
          email: user.email,
          role: user.role,
          authorityProfile: user.authorityProfile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          authorityProfile: {
            include: { department: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          accountId: user.accountId,
          email: user.email,
          role: user.role,
          authorityProfile: user.authorityProfile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await AuditService.log({
          userId: req.user.id,
          action: 'USER_LOGOUT',
          entityType: 'USER',
          entityId: req.user.id,
          req
        });
      }

      res.clearCookie('token');
      res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }
}
