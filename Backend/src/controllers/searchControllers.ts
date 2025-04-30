import { Request, Response } from 'express';
import FormSubmissionModel from '../models/Forms/FormSubmission';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import { employeeOptions, fundingStages, industries, investmentCriteria, ticketSizes } from '../constants/profileOptions';
const locations = require('../constants/profileOptions').locations || [];

/**
 * Calculate match score between startup and investor
 */
const calculateMatchScore = (startup: any, investor: any): { score: number, categories: any } => {
    let score = 0;
    const categories: any = {};

    // Industry match (max 30 points)
    if (investor.industriesOfInterest?.includes(startup.industry)) {
        score += 30;
        categories.Industry = 30;
    } else {
        categories.Industry = 0;
    }

    // Funding stage match (max 30 points)
    if (investor.preferredStages?.includes(startup.fundingStage)) {
        score += 30;
        categories.Stage = 30;
    } else {
        categories.Stage = 0;
    }

    // Employee count compatibility (max 15 points)
    // Consider startup size vs investor preferred size ranges
    if (startup.employeeCount) {
        // Simple scaling based on employee count compatibility
        // More sophisticated logic could be implemented
        const employeeCountScore = 15;
        score += employeeCountScore;
        categories.Size = employeeCountScore;
    }

    // Location match (max 10 points)
    if (investor.investmentRegions && startup.location) {
        // Check if startup's location matches any of investor's regions
        // This is simplified - would need proper region mapping
        const locationScore = 10;
        score += locationScore;
        categories.Location = locationScore;
    }

    // Revenue potential alignment (max 15 points)
    if (startup.revenue && investor.ticketSize) {
        // Logic to compare revenue vs ticket size expectations
        const revenueScore = 15;
        score += revenueScore;
        categories.Revenue = revenueScore;
    }

    return { score, categories };
};

/**
 * Search for startups with filters
 */
export const searchStartups = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get current user (presumably an investor)
        const userId = req.user?.userId;
        const currentUser = userId ? await InvestorProfileModel.findOne({ userId }) : null;

        const {
            industry,
            fundingStage,
            employeeCount,
            location,
            hasFormSubmission,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            matchScore = 0,
            keywords
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = Number(page);
        const limitNum = Number(limit);

        // Build query object
        const query: any = {};

        if (industry) {
            // Handle single industry or array of industries
            const industryList = Array.isArray(industry) ? industry : [industry];
            query.industry = { $in: industryList };
        }

        if (fundingStage) {
            const stageList = Array.isArray(fundingStage) ? fundingStage : [fundingStage];
            query.fundingStage = { $in: stageList };
        }

        if (employeeCount) {
            query.employeeCount = employeeCount;
        }

        if (location) {
            // Case insensitive partial match for location
            query.location = { $regex: new RegExp(location as string, 'i') };
        }

        // Handle global search with keywords
        if (keywords) {
            // Create a text search across multiple fields
            const searchRegex = new RegExp(keywords as string, 'i');
            query.$or = [
                { companyName: searchRegex },
                { description: searchRegex },
                { industry: searchRegex },
                { email: searchRegex },
                { location: searchRegex }
            ];
        }

        // Prepare for form submission filtering
        let userIdsWithFormSubmission: string[] = [];
        if (hasFormSubmission === 'true' || hasFormSubmission === 'false') {
            // Get all startup user IDs that match our base criteria
            const startupUserIds = await StartupProfileModel.find(query).distinct('userId');

            // Find which ones have form submissions
            userIdsWithFormSubmission = await FormSubmissionModel.find({
                userId: { $in: startupUserIds }
            }).distinct('userId');
        }

        // Get all matching startups for filtering (without pagination)
        const allStartups = await StartupProfileModel.find(query).lean();

        // Apply form submission filtering
        let filteredStartups = allStartups;
        if (hasFormSubmission === 'true') {
            filteredStartups = allStartups.filter(startup =>
                userIdsWithFormSubmission.includes(startup.userId));
        } else if (hasFormSubmission === 'false') {
            filteredStartups = allStartups.filter(startup =>
                !userIdsWithFormSubmission.includes(startup.userId));
        }

        // Calculate match scores and apply score filtering
        const scoredStartups = filteredStartups.map(startup => {
            // Calculate match score if current user is an investor
            let matchScoreObj = { score: 0, categories: {} };
            if (currentUser) {
                matchScoreObj = calculateMatchScore(startup, currentUser);
            }

            return {
                ...startup,
                id: startup.userId,
                matchScore: matchScoreObj.score,
                matchCategories: matchScoreObj.categories
            };
        }).filter(startup =>
            // Filter by minimum match score if specified
            !matchScore || startup.matchScore >= Number(matchScore)
        );

        // Sort results
        const sortedStartups = [...scoredStartups].sort((a, b) => {
            const fieldA = a[sortBy as keyof typeof a];
            const fieldB = b[sortBy as keyof typeof b];

            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return sortOrder === 'asc'
                    ? fieldA.localeCompare(fieldB)
                    : fieldB.localeCompare(fieldA);
            }

            if (sortOrder === 'asc') {
                return (fieldA ?? 0) > (fieldB ?? 0) ? 1 : -1;
            } else {
                return (fieldA ?? 0) < (fieldB ?? 0) ? 1 : -1;
            }
        });

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedStartups = sortedStartups.slice(startIndex, startIndex + limitNum);

        // Total count for pagination
        const totalCount = sortedStartups.length;
        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            startups: paginatedStartups,
            pagination: {
                total: totalCount,
                page: pageNum,
                pages: totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error searching startups:', error);
        res.status(500).json({
            message: 'Error searching startups',
            error: (error as Error).message
        });
    }
};

/**
 * Search for investors with filters
 */
export const searchInvestors = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get current user (presumably a startup)
        const userId = req.user?.userId;
        const currentUser = userId ? await StartupProfileModel.findOne({ userId }) : null;

        const {
            industry,
            fundingStage,
            ticketSize,
            investmentCriterion,
            hasFormSubmission,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            matchScore = 0,
            keywords
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = Number(page);
        const limitNum = Number(limit);

        // Build query object
        const query: any = {};

        if (industry) {
            // For investors, we need to match against industriesOfInterest array
            const industryList = Array.isArray(industry) ? industry : [industry];
            query.industriesOfInterest = { $in: industryList };
        }

        if (fundingStage) {
            // For investors, we need to match against preferredStages array
            const stageList = Array.isArray(fundingStage) ? fundingStage : [fundingStage];
            query.preferredStages = { $in: stageList };
        }

        if (ticketSize) {
            query.ticketSize = ticketSize;
        }

        if (investmentCriterion) {
            // Match investors who have the specified investment criteria
            const criteriaList = Array.isArray(investmentCriterion) ? investmentCriterion : [investmentCriterion];
            query.investmentCriteria = { $in: criteriaList };
        }

        // Handle global search with keywords
        if (keywords) {
            // Create a text search across multiple fields
            const searchRegex = new RegExp(keywords as string, 'i');
            query.$or = [
                { companyName: searchRegex },
                { description: searchRegex },
                { industriesOfInterest: searchRegex },
                { email: searchRegex },
                { investmentCriteria: searchRegex }
            ];
        }

        // Prepare for form submission filtering
        let userIdsWithFormSubmission: string[] = [];
        if (hasFormSubmission === 'true' || hasFormSubmission === 'false') {
            // Get all investor user IDs that match our base criteria
            const investorUserIds = await InvestorProfileModel.find(query).distinct('userId');

            // Find which ones have form submissions
            userIdsWithFormSubmission = await FormSubmissionModel.find({
                userId: { $in: investorUserIds }
            }).distinct('userId');
        }

        // Get all matching investors for filtering (without pagination)
        const allInvestors = await InvestorProfileModel.find(query).lean();

        // Apply form submission filtering
        let filteredInvestors = allInvestors;
        if (hasFormSubmission === 'true') {
            filteredInvestors = allInvestors.filter(investor =>
                userIdsWithFormSubmission.includes(investor.userId));
        } else if (hasFormSubmission === 'false') {
            filteredInvestors = allInvestors.filter(investor =>
                !userIdsWithFormSubmission.includes(investor.userId));
        }

        // Calculate match scores and apply score filtering
        const scoredInvestors = filteredInvestors.map(investor => {
            // Calculate match score if current user is a startup
            let matchScoreObj = { score: 0, categories: {} };
            if (currentUser) {
                matchScoreObj = calculateMatchScore(currentUser, investor);
            }

            return {
                ...investor,
                id: investor.userId,
                matchScore: matchScoreObj.score,
                matchCategories: matchScoreObj.categories
            };
        }).filter(investor =>
            // Filter by minimum match score if specified
            !matchScore || investor.matchScore >= Number(matchScore)
        );

        // Sort results
        const sortedInvestors = [...scoredInvestors].sort((a, b) => {
            const fieldA = a[sortBy as keyof typeof a];
            const fieldB = b[sortBy as keyof typeof b];

            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return sortOrder === 'asc'
                    ? fieldA.localeCompare(fieldB)
                    : fieldB.localeCompare(fieldA);
            }

            if (sortOrder === 'asc') {
                return (fieldA ?? 0) > (fieldB ?? 0) ? 1 : -1;
            } else {
                return (fieldA ?? 0) < (fieldB ?? 0) ? 1 : -1;
            }
        });

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedInvestors = sortedInvestors.slice(startIndex, startIndex + limitNum);

        // Total count for pagination
        const totalCount = sortedInvestors.length;
        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            investors: paginatedInvestors,
            pagination: {
                total: totalCount,
                page: pageNum,
                pages: totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error searching investors:', error);
        res.status(500).json({
            message: 'Error searching investors',
            error: (error as Error).message
        });
    }
};

/**
 * Get filter options to populate search dropdowns
 */
export const getFilterOptions = async (req: Request, res: Response): Promise<void> => {
    try {
        // Import the locations from constants or provide an empty array if not yet defined

        res.json({
            industries,
            fundingStages,
            employeeOptions,
            ticketSizes,
            investmentCriteria,
            locations
        });
    } catch (error) {
        console.error('Error getting filter options:', error);
        res.status(500).json({
            message: 'Error getting filter options',
            error: (error as Error).message
        });
    }
};