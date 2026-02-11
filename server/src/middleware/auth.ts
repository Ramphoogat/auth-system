import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'JWT secret is not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { id?: string; role?: string };
    if (!decoded.id) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
    if (req.userRole !== 'admin') {
        res.status(403).json({ message: 'Access denied. Admin only.' });
        return;
    }
    next();
};
