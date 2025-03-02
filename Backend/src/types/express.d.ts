// types/express.d.ts
import { Express } from 'express';

declare global {
    namespace Express {
        interface User {
            userId: string;
            role?: string;
            // add other user properties you need
        }

        interface Request {
            user?: User;
        }
    }
}

export { };