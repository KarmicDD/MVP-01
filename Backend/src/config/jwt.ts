import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT settings
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId: string, email: string, role: string | null) => {
    return jwt.sign(
        {
            userId,
            email,
            role
        },
        JWT_SECRET as Secret,
    );
};

// Verify JWT token
const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET as Secret);
    } catch (error) {
        return null;
    }
};

export { generateToken, verifyToken };
