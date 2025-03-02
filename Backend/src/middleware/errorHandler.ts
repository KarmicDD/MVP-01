import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Token expired' });
        return;
    }

    // Prisma errors
    if (err.code === 'P2002') {
        res.status(400).json({ message: 'Unique constraint violation' });
        return;
    }

    // Default error
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

export default errorHandler;
