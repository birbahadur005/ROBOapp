import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    accountId: string;
    email: string;
    role: string;
    authorityId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { authorityProfile: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User account is inactive or no longer exists.' });
    }

    req.user = {
      id: user.id,
      accountId: user.accountId,
      email: user.email,
      role: user.role,
      authorityId: user.authorityProfile?.id
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
};
