import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../config/jwt';
// @ts-ignore
import { validationResult } from 'express-validator';
import { sanitizeEmail, sanitizeInput, checkRateLimit } from '../utils/security';
import { regenerateCSRFTokenForSession } from '../middleware/csrfRegeneration';

const frontendUrl = 'https://karmicdd.netlify.app';
// Register new user
const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Rate limiting check
        const clientIP = req.ip || 'unknown';
        const rateLimitResult = checkRateLimit(`register:${clientIP}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

        if (!rateLimitResult.allowed) {
            console.warn('Rate limit exceeded for registration from IP:', clientIP);
            res.status(429).json({
                message: 'Too many registration attempts. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            });
            return;
        }

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        // Sanitize input data
        const sanitizedBody = sanitizeInput(req.body);
        const { email, password, role, fullName } = sanitizedBody;

        // Additional email validation and sanitization
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            res.status(400).json({ message: 'Invalid email address format' });
            return;
        }

        // Check if user already exists
        const userCheck = await prisma.user.findUnique({
            where: {
                email: sanitizedEmail,
            },
        });

        if (userCheck) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password with enhanced security
        const passwordHash = await hashPassword(password);

        // Create user in Prisma with sanitized data
        const newUser = await prisma.user.create({
            data: {
                user_id: uuidv4(),
                email: sanitizedEmail,
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

        // Regenerate CSRF token for new session
        const newCSRFToken = regenerateCSRFTokenForSession(req);
        if (newCSRFToken) {
            res.setHeader('X-New-CSRF-Token', newCSRFToken);
        }

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
    try {
        // Rate limiting check for login attempts
        const clientIP = req.ip || 'unknown';
        const rateLimitResult = checkRateLimit(`login:${clientIP}`, 10, 15 * 60 * 1000); // 10 attempts per 15 minutes

        if (!rateLimitResult.allowed) {
            console.warn('Rate limit exceeded for login from IP:', clientIP);
            res.status(429).json({
                message: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            });
            return;
        }

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        // Sanitize input data
        const sanitizedBody = sanitizeInput(req.body);
        const { email, password } = sanitizedBody;

        // Additional email validation and sanitization
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            res.status(400).json({ message: 'Invalid email address format' });
            return;
        }

        // Find user by email with sanitized email
        const user = await prisma.user.findUnique({
            where: {
                email: sanitizedEmail,
            },
        });

        // Check if user exists
        if (!user) {
            res.status(401).json({ message: 'No account found with this email address. Please register first.' });
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

        // Regenerate CSRF token for new session
        const newCSRFToken = regenerateCSRFTokenForSession(req);
        if (newCSRFToken) {
            res.setHeader('X-New-CSRF-Token', newCSRFToken);
        }

        const responseData = {
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                role: user.role
            }
        };

        res.json(responseData);
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
            res.redirect(`${frontendUrl}/auth/select-role?userId=${user_id}&token=${token}`);
            return;
        }

        // Redirect to frontend with token
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    };
};

export { register, login, updateOAuthUserRole, handleOAuthCallback };

