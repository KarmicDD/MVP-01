import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

// Extend the Express Request interface to include the user property
declare global {
    namespace Express {
        interface User {
            userId: string;
            email: string;
            role?: string | null;
        }

        interface Request {
            user?: User;
        }
    }
}

// Define UserPayload to match the structure of Express.User
interface UserPayload {
    userId: string;
    email: string;
    role?: string | null;
}

// Authentication middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    // Get token from header, query or cookies
    const token = req.headers.authorization?.split(' ')[1] ||
        req.query.token as string ||
        req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    // Verify token
    try {
        const decoded = verifyToken(token) as UserPayload;

        // Attach user data to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};

// Role-based authorization middleware
const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const userRole = req.user.role;
        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        next();
    };
};

export { authenticateJWT, authorizeRole };