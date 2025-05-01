import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './db';
import dotenv from 'dotenv';

dotenv.config();

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "https://mvp-01.onrender.com/api/auth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
        // Extract user data from Google profile
        const email = profile.emails[0].value;

        // Check if user exists
        const userResult = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { oauth_provider: 'google', oauth_id: profile.id },
                ],
            },
        });

        if (userResult) {
            // User exists, return user
            return done(null, userResult);
        }

        // User doesn't exist, create new user
        const newUserResult = await prisma.user.create({
            data: {
                user_id: uuidv4(),
                email: email,
                oauth_provider: 'google',
                oauth_id: profile.id,
                role: 'pending', // Temporary role until user selects startup or investor
                updated_at: new Date()
            },
        });

        // Set flag to indicate this is a new user (for frontend redirection)
        const userWithFlag = {
            ...newUserResult,
            isNewUser: true
        };

        return done(null, userWithFlag);
    } catch (error) {
        console.error('Google auth error:', error);
        return done(error);
    }
}));

// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID as string,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    callbackURL: `${process.env.API_URL}/api/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
        // Extract user data from LinkedIn profile
        const email = profile.emails[0].value;

        // Check if user exists
        const userResult = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { oauth_provider: 'linkedin', oauth_id: profile.id },
                ],
            },
        });

        if (userResult) {
            // User exists, return user
            return done(null, userResult);
        }

        // User doesn't exist, create new user
        const newUserResult = await prisma.user.create({
            data: {
                user_id: uuidv4(),
                email: email,
                oauth_provider: 'linkedin',
                oauth_id: profile.id,
                role: 'pending', // Temporary role until user selects startup or investor
                updated_at: new Date()
            },
        });

        // Set flag to indicate this is a new user (for frontend redirection)
        const userWithFlag = {
            ...newUserResult,
            isNewUser: true
        };

        return done(null, userWithFlag);
    } catch (error) {
        console.error('LinkedIn auth error:', error);
        return done(error);
    }
}));

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { user_id: id }
        });

        if (user) {
            // Transform to match the User interface
            const transformedUser = {
                userId: user.user_id,
                email: user.email,
                role: user.role
            };
            done(null, transformedUser);
        } else {
            done(null, null);
        }
    } catch (error) {
        done(error);
    }
});

export default passport;