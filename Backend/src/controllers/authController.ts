import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../config/jwt';
// @ts-ignore
import { validationResult } from 'express-validator';

// Register new user
const register = async (req: Request, res: Response): Promise<void> => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email, password, role } = req.body;

    try {
        // Check if user already exists
        const userCheck = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (userCheck) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user in Prisma
        const newUser = await prisma.user.create({
            data: {
                user_id: uuidv4(),
                email: email,
                password_hash: passwordHash,
                role: role,
            },
            select: {
                user_id: true,
                email: true,
                role: true,
            },
        });

        // Generate JWT token
        const token = generateToken(
            newUser.user_id,
            newUser.email,
            newUser.role
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                userId: newUser.user_id,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login with email/password
const login = async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        // Check if user exists
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check if user has a password (not OAuth-only)
        if (!user.password_hash) {
            res.status(401).json({
                message: 'This account uses social login. Please sign in with your social provider.'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = generateToken(user.user_id, user.email, user.role);

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export { register, login };
