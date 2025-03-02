import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

interface UserPayload {
    userId: string;
    email: string;
    role: string | null;
}

// Extend the Express Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

// Authentication middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    // Get token from header, query or cookies
    const token = req.headers.authorization?.split(' ')[1] ||
        req.query.token ||
        req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = verifyToken(token) as UserPayload;
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user data to request
    req.user = decoded;
    next();
};

// Role-based authorization middleware
const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role as string)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};

export { authenticateJWT, authorizeRole };
