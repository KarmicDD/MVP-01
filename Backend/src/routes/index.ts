// routes/index.ts
import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import matchingRoutes from './matchingRoutes';
import compatibilityRoutes from './compatibilityControllerRoutes';
import questionnaireRoutes from './questionnaireRoute';
import beliefSystemRoutes from './BelifSystemRoutes';
import emailRoutes from './emailRoutes';
import searchRoutes from './searchRoutes';
import financialDueDiligenceRoutes from './financialDueDiligenceRoutes';
import recommendationRoutes from './recommendationRoutes';

const router = express.Router();

// Log all incoming requests
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Register all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/matching', matchingRoutes);
router.use('/score', compatibilityRoutes);
router.use('/questionnaire', questionnaireRoutes);
router.use('/analysis', beliefSystemRoutes);
router.use('/email', emailRoutes);
router.use('/search', searchRoutes);
// Financial due diligence routes
console.log('Registering financial due diligence routes');
router.use('/financial', financialDueDiligenceRoutes);

// Recommendation routes
console.log('Registering recommendation routes');
router.use('/recommendations', recommendationRoutes);

export default router;
