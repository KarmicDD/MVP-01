// routes/index.ts
import express from 'express';
import authRoutes from './userAuth/authRoutes';
import userRoutes from './userAuth/userRoutes';
import profileRoutes from './userAuth/profileRoutes';
import matchingRoutes from './matching/matchingRoutes';
import compatibilityRoutes from './matching/compatibilityControllerRoutes';
import questionnaireRoutes from './matching/questionnaireRoute';
import beliefSystemRoutes from './matching/BelifSystemRoutes';
import emailRoutes from './emailRoutes';
import searchRoutes from './searchRoutes';
import financialDueDiligenceRoutes from './financialDueDiligence/financialDueDiligenceRoutes';
import newFinancialDueDiligenceRoutes from './financialDueDiligence/newFinancialDueDiligenceRoutes';
import legalDueDiligenceRoutes from './legalDueDiligence/legalDueDiligenceRoutes';
import recommendationRoutes from './analytics/recommendationRoutes';
import analyticsRoutes from './analytics/analyticsRoutes';
import dashboardRoutes from './analytics/dashboardRoutes';
import taskRoutes from './taskRoutes';
import logger from '../utils/logger';

const router = express.Router();

// Log route registration
const logRouteRegistration = (path: string, description: string) => {
    logger.info(`Registering ${description}`, { path, route: path }, 'ROUTE_SETUP');
};

// Enhanced request logging middleware (this will be replaced by our global middleware)
router.use((req, res, next) => {
    // This is now handled by our enhanced logging middleware in app.ts
    next();
});

// Register all routes with enhanced logging
logRouteRegistration('/auth', 'authentication routes');
router.use('/auth', authRoutes);

logRouteRegistration('/users', 'user management routes');
router.use('/users', userRoutes);

logRouteRegistration('/profile', 'profile management routes');
router.use('/profile', profileRoutes);

logRouteRegistration('/matching', 'startup-investor matching routes');
router.use('/matching', matchingRoutes);

logRouteRegistration('/score', 'compatibility scoring routes');
router.use('/score', compatibilityRoutes);

logRouteRegistration('/questionnaire', 'questionnaire routes');
router.use('/questionnaire', questionnaireRoutes);

logRouteRegistration('/analysis', 'belief system analysis routes');
router.use('/analysis', beliefSystemRoutes);

logRouteRegistration('/email', 'email service routes');
router.use('/email', emailRoutes);

logRouteRegistration('/search', 'search functionality routes');
router.use('/search', searchRoutes);

// Financial due diligence routes
logRouteRegistration('/financial', 'financial due diligence routes');
router.use('/financial', financialDueDiligenceRoutes);

// New Financial due diligence routes
logRouteRegistration('/new-financial', 'enhanced financial due diligence routes');
router.use('/new-financial', newFinancialDueDiligenceRoutes);

// Legal due diligence routes
logRouteRegistration('/legal-due-diligence', 'legal due diligence routes');
router.use('/legal-due-diligence', legalDueDiligenceRoutes);

// Recommendation routes
logRouteRegistration('/recommendations', 'AI recommendation routes');
router.use('/recommendations', recommendationRoutes);

// Analytics routes
logRouteRegistration('/analytics', 'analytics and metrics routes');
router.use('/analytics', analyticsRoutes);

// Dashboard routes
logRouteRegistration('/dashboard', 'dashboard data routes');
router.use('/dashboard', dashboardRoutes);

// Task routes
logRouteRegistration('/tasks', 'task management routes');
router.use('/tasks', taskRoutes);

logger.success('All API routes registered successfully', {
    totalRoutes: 16,
    categories: [
        'Authentication', 'User Management', 'Profiles', 'Matching', 'Compatibility',
        'Questionnaires', 'Belief Systems', 'Email', 'Search', 'Financial DD',
        'Legal DD', 'Recommendations', 'Analytics', 'Dashboard', 'Tasks'
    ]
}, 'ROUTE_SETUP');

export default router;
