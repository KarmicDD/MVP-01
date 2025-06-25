import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../config/jwt';
// @ts-ignore
import { validationResult } from 'express-validator';
import { sanitizeEmail, sanitizeInput, checkRateLimit } from '../utils/security';

const frontendUrl = 'https://karmicdd.netlify.app';
// Register new user
const register = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('=== REGISTRATION ATTEMPT ===');
        console.log('Request method:', req.method);
        console.log('Request path:', req.path);
        console.log('Request URL:', req.url);
        console.log('Request headers:', JSON.stringify(req.headers, null, 2));
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        // Rate limiting check
        const clientIP = req.ip || 'unknown';
        const rateLimitResult = checkRateLimit(`register:${clientIP}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

        if (!rateLimitResult.allowed) {
            console.log('Rate limit exceeded for registration, IP:', clientIP);
            res.status(429).json({
                message: 'Too many registration attempts. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            });
            return;
        }

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Registration validation errors:', errors.array());
            res.status(400).json({ errors: errors.array() });
            return;
        }

        // Sanitize input data
        const sanitizedBody = sanitizeInput(req.body);
        const { email, password, role, fullName } = sanitizedBody;
        console.log('Registration data - Email:', email, 'Role:', role, 'FullName:', fullName, 'Password provided:', !!password);

        // Additional email validation and sanitization
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            console.log('Invalid email format for registration:', email);
            res.status(400).json({ message: 'Invalid email address format' });
            return;
        }

        // Check if user already exists
        const userCheck = await prisma.user.findUnique({
            where: {
                email: sanitizedEmail,
            },
        });

        console.log('Existing user check:', !!userCheck);
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

        console.log('New user created:', newUser);

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
    try {
        console.log('=== LOGIN ATTEMPT START ===');
        console.log('Request method:', req.method);
        console.log('Request path:', req.path);
        console.log('Request URL:', req.url);
        console.log('Request originalUrl:', req.originalUrl);
        console.log('Request headers:', JSON.stringify(req.headers, null, 2));
        console.log('Request body keys:', Object.keys(req.body || {}));
        console.log('Client IP:', req.ip);

        // Rate limiting check for login attempts
        const clientIP = req.ip || 'unknown';
        const rateLimitResult = checkRateLimit(`login:${clientIP}`, 10, 15 * 60 * 1000); // 10 attempts per 15 minutes

        if (!rateLimitResult.allowed) {
            console.log('Rate limit exceeded for IP:', clientIP);
            res.status(429).json({
                message: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            });
            return;
        }

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            res.status(400).json({ errors: errors.array() });
            return;
        }

        // Sanitize input data
        const sanitizedBody = sanitizeInput(req.body);
        const { email, password } = sanitizedBody;
        console.log('Sanitized email:', email);
        console.log('Password provided:', !!password);

        // Additional email validation and sanitization
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            console.log('Invalid email format:', email);
            res.status(400).json({ message: 'Invalid email address format' });
            return;
        }

        console.log('Looking for user with email:', sanitizedEmail);

        // Find user by email with sanitized email
        const user = await prisma.user.findUnique({
            where: {
                email: sanitizedEmail,
            },
        });

        console.log('User found in database:', !!user);
        if (user) {
            console.log('User details:', {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                hasPassword: !!user.password_hash,
                created_at: user.created_at
            });
        }

        // Check if user exists
        if (!user) {
            console.log('No user found with email:', sanitizedEmail);
            res.status(401).json({ message: 'No account found with this email address. Please register first.' });
            return;
        }

        // Check if user has a password (not OAuth-only)
        if (!user.password_hash) {
            console.log('User has no password (OAuth-only account):', sanitizedEmail);
            res.status(401).json({
                message: 'This account uses social login. Please sign in with your social provider.'
            });
            return;
        }

        // Verify password
        console.log('Verifying password...');
        const isPasswordValid = await comparePassword(password, user.password_hash);
        console.log('Password verification result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Invalid password for user:', sanitizedEmail);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        console.log('Generating JWT token...');
        const token = generateToken(user.user_id, user.email, user.role);
        console.log('JWT token generated successfully, length:', token.length);

        const responseData = {
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                role: user.role
            }
        };

        console.log('Sending successful login response for user:', user.email);
        console.log('Response structure:', {
            message: responseData.message,
            tokenLength: responseData.token.length,
            userRole: responseData.user.role
        });
        console.log('=== LOGIN ATTEMPT END (SUCCESS) ===');

        res.json(responseData);
    } catch (error) {
        console.error('=== LOGIN ERROR ===');
        console.error('Login error - Full details:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
        console.log('=== LOGIN ATTEMPT END (ERROR) ===');
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

