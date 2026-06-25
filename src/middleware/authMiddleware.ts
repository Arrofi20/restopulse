import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; outletId: string };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, outletId: decoded.outletId };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
    });
  }
}
