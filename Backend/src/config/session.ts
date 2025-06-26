import session from 'express-session';
import FileStore from 'session-file-store';
import path from 'path';
import fs from 'fs';

// Create file store
const SessionFileStore = FileStore(session);

/**
 * Session configuration with file-based store for both development and production
 * This doesn't require Redis or external databases and persists sessions across restarts
 */
export const createSessionConfig = () => {
    // Ensure sessions directory exists with proper error handling
    const sessionsDir = path.join(process.cwd(), 'sessions');
    try {
        if (!fs.existsSync(sessionsDir)) {
            fs.mkdirSync(sessionsDir, { recursive: true });
            console.log(`📁 Created sessions directory: ${sessionsDir}`);
        }
    } catch (error) {
        console.error('❌ Failed to create sessions directory:', error);
        console.error('⚠️  Falling back to in-memory sessions');
    }

    const sessionConfig: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production', // HTTPS required for 'none'
            httpOnly: true, // Prevent XSS attacks
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
        },
        name: 'karmicDD.sid' // Don't use default session name
    };

    // Use file store in both development and production modes
    try {
        sessionConfig.store = new SessionFileStore({
            path: sessionsDir,
            ttl: 24 * 60 * 60, // 24 hours in seconds
            retries: 3,
            factor: 2,
            minTimeout: 50,
            maxTimeout: 100,
            reapInterval: 60 * 60, // Clean up expired sessions every hour
            reapAsync: true,
            logFn: (message: string) => {
                console.log('[SESSION-STORE]', message);
            }
        });

        const modeText = process.env.NODE_ENV === 'production' ? 'production' : 'development';
        console.log(`✅ File-based session store configured for ${modeText} mode`);
        console.log(`📁 Sessions stored in: ${sessionsDir}`);
    } catch (error) {
        console.error('❌ Failed to initialize file session store:', error);
        console.error('⚠️  Falling back to in-memory sessions (sessions will be lost on restart)');
    }

    return sessionConfig;
};
