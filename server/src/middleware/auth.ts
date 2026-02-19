import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: {
    username?: string;
    email?: string;
  };
}

export const authToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    console.warn('AuthToken: No token provided');
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    console.error('AuthToken: JWT_SECRET not configured');
    res.status(500).json({ message: 'JWT secret is not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { id?: any; _id?: any; role?: string, email?: string, username?: string };
    // tolerate id as string or ObjectId
    const decodedId = decoded.id ?? decoded._id;
    if (!decodedId) {
      console.warn('AuthToken: Invalid token payload (no ID)');
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.userId = typeof decodedId === 'string' ? decodedId : String(decodedId);
    req.userRole = decoded.role;
    req.user = {
        email: decoded.email,
        username: decoded.username // Ensure token has this or handle undefined
    };
    next();
  } catch (err: any) {
    console.warn(`AuthToken: Token verification failed: ${err.message}`);
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

export const authAuthor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
    const allowedRoles = ['admin', 'author'];
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied. Author privileges required.' });
        return;
    }
    next();
};

export const authEditor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
    const allowedRoles = ['admin', 'author', 'editor'];
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied. Editor privileges required.' });
        return;
    }
    next();
};
