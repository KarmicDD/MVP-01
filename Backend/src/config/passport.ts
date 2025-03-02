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
    callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
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
        // Note: Role will need to be set during the first login flow
        const newUserResult = await prisma.user.create({
            data: {
                user_id: uuidv4(),
                email: email,
                oauth_provider: 'google',
                oauth_id: profile.id,
            },
        });

        return done(null, newUserResult);
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
            },
        });

        return done(null, newUserResult);
    } catch (error) {
        console.error('LinkedIn auth error:', error);
        return done(error);
    }
}));

export default passport;
