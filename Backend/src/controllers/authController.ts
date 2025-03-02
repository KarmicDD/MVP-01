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

// Update role for OAuth user
const updateOAuthUserRole = async (req: Request, res: Response) => {
    const { userId, role } = req.body;

    try {
        // Update user role
        await prisma.user.update({
            where: {
                user_id: userId,
            },
            data: {
                role: role,
            },
        });

        // Get updated user
        const userResult = await prisma.user.findUnique({
            where: {
                user_id: userId,
            },
            select: {
                user_id: true,
                email: true,
                role: true,
            },
        });

        if (!userResult) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Generate JWT with updated role
        const token = generateToken(userResult.user_id, userResult.email, userResult.role);

        res.json({
            message: 'User role updated successfully',
            token,
            user: {
                userId: userResult.user_id,
                email: userResult.email,
                role: userResult.role
            }
        });
    } catch (error) {
        console.error('Update OAuth user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Handle OAuth callback
const handleOAuthCallback = (provider: string) => {
    return (req: Request, res: Response) => {
        // Generate JWT token
        const user: any = req.user; // Type assertion here

        if (!user) {
            res.status(500).json({ message: 'User not found after OAuth' });
            return;
        }

        const { user_id, email, role } = user;
        const token = generateToken(user_id, email, role);

        // Check if role is set
        if (!role) {
            // Redirect to frontend role selection with userId for later update
            res.redirect(`${process.env.FRONTEND_URL}/auth/select-role?userId=${user_id}&token=${token}`);
            return;
        }

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    };
};

export { register, login, updateOAuthUserRole, handleOAuthCallback };

