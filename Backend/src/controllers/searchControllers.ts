import { Request, Response } from 'express';
import FormSubmissionModel from '../models/Forms/FormSubmission';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import { employeeOptions, fundingStages, industries, investmentCriteria, ticketSizes } from '../constants/profileOptions';


/**
 * Search for startups with filters
 */
export const searchStartups = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            industry,
            fundingStage,
            employeeCount,
            location,
            hasFormSubmission,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
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

            res.json({
                startups: filteredStartups,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    pages: Math.ceil(totalCount / Number(limit))
                }
            });
            return;
        }

        // Standard query execution (no form submission filtering)
        const startups = await startupQuery.exec();
        const totalCount = await StartupProfileModel.countDocuments(query);

        res.json({
            startups,
            pagination: {
                total: totalCount,
                page: Number(page),
                pages: Math.ceil(totalCount / Number(limit))
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
        const {
            industry,
            fundingStage,
            ticketSize,
            investmentCriterion,
            hasFormSubmission,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
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

            res.json({
                investors: filteredInvestors,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    pages: Math.ceil(totalCount / Number(limit))
                }
            });
            return;
        }

        // Standard query execution (no form submission filtering)
        const investors = await investorQuery.exec();
        const totalCount = await InvestorProfileModel.countDocuments(query);

        res.json({
            investors,
            pagination: {
                total: totalCount,
                page: Number(page),
                pages: Math.ceil(totalCount / Number(limit))
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
        res.json({
            industries,
            fundingStages,
            employeeOptions,
            ticketSizes,
            investmentCriteria
        });
    } catch (error) {
        console.error('Error getting filter options:', error);
        res.status(500).json({
            message: 'Error getting filter options',
            error: (error as Error).message
        });
    }
};