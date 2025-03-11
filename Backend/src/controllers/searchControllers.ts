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
        const userId = req.user?.userId; // Changed from req.user?.id to req.user?.userId
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
            matchScore = 0
        } = req.query;

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

        // For pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Sorting
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Execute main query
        let startupQuery = StartupProfileModel.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // If we need to filter by form submission
        if (hasFormSubmission === 'true' || hasFormSubmission === 'false') {
            const startups = await startupQuery.exec();

            // Get IDs of startups that have form submissions
            const startupIds = startups.map(startup => startup.userId);
            const formSubmissions = await FormSubmissionModel.find({
                userId: { $in: startupIds }
            }).distinct('userId');

            // Filter startups based on form submissions
            const filteredStartups = startups.filter(startup => {
                const hasSubmission = formSubmissions.includes(startup.userId);
                return hasFormSubmission === 'true' ? hasSubmission : !hasSubmission;
            });

            // Count for pagination info
            const totalCount = await StartupProfileModel.countDocuments(query);

            // Map results and add match scores
            const mappedStartups = filteredStartups.map(startup => {
                const startupObj = startup.toObject();

                // Calculate match score if current user is an investor
                let matchScoreObj = { score: 0, categories: {} };
                if (currentUser) {
                    matchScoreObj = calculateMatchScore(startupObj, currentUser);
                }

                // Only include startups that meet minimum match score criteria
                if (matchScore && matchScoreObj.score < Number(matchScore)) {
                    return null;
                }

                return {
                    ...startupObj,
                    id: startup.userId,
                    matchScore: matchScoreObj.score,
                    matchCategories: matchScoreObj.categories
                };
            }).filter(Boolean); // Remove null values

            // Adjust total count if filtering by match score
            const adjustedCount = matchScore ? mappedStartups.length : totalCount;

            res.json({
                startups: mappedStartups,
                pagination: {
                    total: adjustedCount,
                    page: Number(page),
                    pages: Math.ceil(adjustedCount / Number(limit)),
                    hasNext: Number(page) < Math.ceil(adjustedCount / Number(limit)),
                    hasPrev: Number(page) > 1
                }
            });
            return;
        }

        // Standard query execution (no form submission filtering)
        const startups = await startupQuery.exec();
        const totalCount = await StartupProfileModel.countDocuments(query);

        // Map results and add match scores
        const mappedStartups = startups.map(startup => {
            const startupObj = startup.toObject();

            // Calculate match score if current user is an investor
            let matchScoreObj = { score: 0, categories: {} };
            if (currentUser) {
                matchScoreObj = calculateMatchScore(startupObj, currentUser);
            }

            // Only include startups that meet minimum match score criteria
            if (matchScore && matchScoreObj.score < Number(matchScore)) {
                return null;
            }

            return {
                ...startupObj,
                id: startup.userId,
                matchScore: matchScoreObj.score,
                matchCategories: matchScoreObj.categories
            };
        }).filter(Boolean); // Remove null values

        // Adjust total count if filtering by match score
        const adjustedCount = matchScore ? mappedStartups.length : totalCount;

        res.json({
            startups: mappedStartups,
            pagination: {
                total: adjustedCount,
                page: Number(page),
                pages: Math.ceil(adjustedCount / Number(limit)),
                hasNext: Number(page) < Math.ceil(adjustedCount / Number(limit)),
                hasPrev: Number(page) > 1
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
        const userId = req.user?.userId; // Changed from req.user?.id to req.user?.userId
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
            matchScore = 0
        } = req.query;

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

        // For pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Sorting
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Execute main query
        let investorQuery = InvestorProfileModel.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // If we need to filter by form submission
        if (hasFormSubmission === 'true' || hasFormSubmission === 'false') {
            const investors = await investorQuery.exec();

            // Get IDs of investors that have form submissions
            const investorIds = investors.map(investor => investor.userId);
            const formSubmissions = await FormSubmissionModel.find({
                userId: { $in: investorIds }
            }).distinct('userId');

            // Filter investors based on form submissions
            const filteredInvestors = investors.filter(investor => {
                const hasSubmission = formSubmissions.includes(investor.userId);
                return hasFormSubmission === 'true' ? hasSubmission : !hasSubmission;
            });

            // Count for pagination info
            const totalCount = await InvestorProfileModel.countDocuments(query);

            // Map results and add match scores
            const mappedInvestors = filteredInvestors.map(investor => {
                const investorObj = investor.toObject();

                // Calculate match score if current user is a startup
                let matchScoreObj = { score: 0, categories: {} };
                if (currentUser) {
                    matchScoreObj = calculateMatchScore(currentUser, investorObj);
                }

                // Only include investors that meet minimum match score criteria
                if (matchScore && matchScoreObj.score < Number(matchScore)) {
                    return null;
                }

                return {
                    ...investorObj,
                    id: investor.userId,
                    matchScore: matchScoreObj.score,
                    matchCategories: matchScoreObj.categories
                };
            }).filter(Boolean); // Remove null values

            // Adjust total count if filtering by match score
            const adjustedCount = matchScore ? mappedInvestors.length : totalCount;

            res.json({
                investors: mappedInvestors,
                pagination: {
                    total: adjustedCount,
                    page: Number(page),
                    pages: Math.ceil(adjustedCount / Number(limit)),
                    hasNext: Number(page) < Math.ceil(adjustedCount / Number(limit)),
                    hasPrev: Number(page) > 1
                }
            });
            return;
        }

        // Standard query execution (no form submission filtering)
        const investors = await investorQuery.exec();
        const totalCount = await InvestorProfileModel.countDocuments(query);

        // Map results and add match scores
        const mappedInvestors = investors.map(investor => {
            const investorObj = investor.toObject();

            // Calculate match score if current user is a startup
            let matchScoreObj = { score: 0, categories: {} };
            if (currentUser) {
                matchScoreObj = calculateMatchScore(currentUser, investorObj);
            }

            // Only include investors that meet minimum match score criteria
            if (matchScore && matchScoreObj.score < Number(matchScore)) {
                return null;
            }

            return {
                ...investorObj,
                id: investor.userId,
                matchScore: matchScoreObj.score,
                matchCategories: matchScoreObj.categories
            };
        }).filter(Boolean); // Remove null values

        // Adjust total count if filtering by match score
        const adjustedCount = matchScore ? mappedInvestors.length : totalCount;

        res.json({
            investors: mappedInvestors,
            pagination: {
                total: adjustedCount,
                page: Number(page),
                pages: Math.ceil(adjustedCount / Number(limit)),
                hasNext: Number(page) < Math.ceil(adjustedCount / Number(limit)),
                hasPrev: Number(page) > 1
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