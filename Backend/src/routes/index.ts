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
import recommendationRoutes from './analytics/recommendationRoutes';
import analyticsRoutes from './analytics/analyticsRoutes';
import dashboardRoutes from './analytics/dashboardRoutes';
import taskRoutes from './taskRoutes';

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

// New Financial due diligence routes
console.log('Registering new financial due diligence routes');
router.use('/new-financial', newFinancialDueDiligenceRoutes);

// Recommendation routes
console.log('Registering recommendation routes');
router.use('/recommendations', recommendationRoutes);

// Analytics routes
console.log('Registering analytics routes');
router.use('/analytics', analyticsRoutes);

// Dashboard routes
console.log('Registering dashboard routes');
router.use('/dashboard', dashboardRoutes);

// Task routes
console.log('Registering task routes');
router.use('/tasks', taskRoutes);

export default router;
