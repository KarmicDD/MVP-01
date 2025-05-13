
// Define additional properties that exist in the MongoDB schema but not in the TypeScript interfaces
export interface AdditionalReportProperties {
    shareholdersTable?: {
        overview: string;
        shareholders: {
            name: string;
            equityPercentage: number | string;
            shareCount: number | string;
            faceValue: number | string;
            investmentAmount?: number | string;
            shareClass?: string;
            votingRights?: string;
            notes?: string;
        }[];
        totalShares: number | string;
        totalEquity: number | string;
        analysis: string;
        recommendations: string[];
    };

    directorsTable?: {
        overview: string;
        directors: {
            name: string;
            position: string;
            appointmentDate?: string;
            din?: string;
            shareholding?: number | string;
            expertise?: string;
            otherDirectorships?: string[];
            notes?: string;
        }[];
        analysis: string;
        recommendations: string[];
    };

    keyBusinessAgreements?: {
        overview: string;
        agreements: {
            type?: string;
            agreementType?: string;
            parties: string[] | string;
            effectiveDate?: string;
            expiryDate?: string;
            keyTerms?: string[];
            financialImpact?: string;
            risks?: string[];
            notes?: string;
            // Additional fields used in the UI
            date?: string;
            duration?: string;
            value?: string | number;
        }[];
        analysis: string;
        recommendations: string[];
    };

    leavePolicy?: {
        overview: string;
        policies: {
            type: string;
            daysAllowed: number | string;
            eligibility?: string;
            carryForward?: string;
            encashment?: string;
            notes?: string;
        }[];
        analysis: string;
        recommendations: string[];
    };

    provisionsAndPrepayments?: {
        overview: string;
        items: {
            name: string;
            type: string;
            amount: number | string;
            period?: string;
            justification?: string;
            notes?: string;
            status?: string;
        }[];
        analysis: string;
        recommendations: string[];
    };

    deferredTaxAssets?: {
        overview: string;
        items: {
            name: string;
            amount: number | string;
            origin?: string;
            expectedUtilization?: string;
            recoverability?: string;
            notes?: string;
            riskLevel?: string;
        }[];
        analysis: string;
        recommendations: string[];
    };

    documentContentAnalysis?: {
        overview: string;
        dueDiligenceFindings: {
            summary: string;
            keyInsights: string[];
            investmentImplications: string[];
            growthIndicators: string[];
            riskFactors: string[];
        };
        auditFindings: {
            summary: string;
            complianceIssues: string[];
            accountingConcerns: string[];
            internalControlWeaknesses: string[];
            fraudRiskIndicators: string[];
        };
        documentSpecificAnalysis: {
            documentType: string;
            contentSummary: string;
            dueDiligenceInsights: string[];
            auditInsights: string[];
            keyFinancialData: string[];
            inconsistencies: string[];
            recommendations: string[];
        }[];
    };

    forwardLookingAnalysis?: {
        marketPotential?: {
            tamSize?: string | number;
            growthRate?: string | number;
            adoptionStage?: string;
            metrics?: {
                name: string;
                value: string | number;
                description?: string;
                trend?: string;
                status?: string;
            }[];
        };
        innovationAssessment?: {
            uniquenessScore?: number;
            ipStrength?: string;
            competitiveAdvantage?: string;
            metrics?: {
                name: string;
                value: string | number;
                description?: string;
                trend?: string;
                status?: string;
            }[];
        };
        teamCapability?: {
            executionScore?: number;
            experienceLevel?: string;
            trackRecord?: string;
            metrics?: {
                name: string;
                value: string | number;
                description?: string;
                trend?: string;
                status?: string;
            }[];
        };
        growthTrajectory?: {
            scenarios?: {
                conservative?: number;
                moderate?: number;
                aggressive?: number;
            };
            unitEconomics?: {
                currentCac?: number;
                projectedCac?: number;
                currentLtv?: number;
                projectedLtv?: number;
            };
            metrics?: {
                name: string;
                value: string | number;
                description?: string;
                trend?: string;
                status?: string;
            }[];
        };
        dimensions?: {
            name: string;
            score: number;
            description: string;
            status: string;
        }[];
        chartData?: any;
    };

    analysisMetadata?: {
        enhancedAnalysis: boolean;
        dataSourcesUsed: {
            documents: boolean;
            startupProfile: boolean;
            investorProfile: boolean;
            extendedProfile: boolean;
            questionnaire: boolean;
            tasks: boolean;
            financialReports: boolean;
            historicalMetrics: boolean;
        };
        analysisTimestamp: string;
    };
}

