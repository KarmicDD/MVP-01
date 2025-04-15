import mongoose, { Schema, Document } from 'mongoose';

/**
 * Enhanced interface for the belief system analysis with more detailed fields
 */
export interface BeliefSystemAnalysis extends Document {
    startupId: string;
    investorId: string;
    perspective: 'startup' | 'investor';
    executiveSummary: {
        headline: string;
        keyFindings: string;
        recommendedActions: string;
        successProbability: number;
        keyNumbers: Array<{ label: string; value: string | number; color: string }>;
    };
    overallMatch: number;
    compatibility: {
        visionAlignment: number;
        coreValues: number;
        businessGoals: number;
        [key: string]: number;
    };
    scoringBreakdown: Array<{ label: string; score: number; description: string }>;
    strengths: Array<{ area: string; score: number; description: string }>;
    weaknesses: Array<{ area: string; score: number; description: string }>;
    risks: {
        marketFitRisk: {
            level: 'High' | 'Medium' | 'Low';
            description: string;
            impactAreas: string[];
        };
        operationalRisk: {
            level: 'High' | 'Medium' | 'Low';
            description: string;
            impactAreas: string[];
        };
        riskHeatmap: Array<{ risk: string; severity: string; probability: number; impact: number }>;
    };
    riskMitigationRecommendations: Array<{
        text: string;
        priority: 'High' | 'Medium' | 'Low';
        timeline: 'Immediate' | 'Short-term' | 'Medium-term' | 'Long-term';
    }>;
    improvementAreas: {
        strategicFocus: string;
        communication: string;
        growthMetrics: string;
        actions: {
            strategicFocus: string[];
            communication: string[];
            growthMetrics: string[];
        };
    };
    createdAt: Date;
    expiresAt: Date;
}

const BeliefSystemAnalysisSchema = new Schema<BeliefSystemAnalysis>({
    startupId: { type: String, required: true },
    investorId: { type: String, required: true },
    perspective: { type: String, enum: ['startup', 'investor'], required: true },
    executiveSummary: {
        headline: { type: String, required: true },
        keyFindings: { type: String, required: true },
        recommendedActions: { type: String, required: true },
        successProbability: { type: Number, required: true },
        keyNumbers: [{
            label: { type: String, required: true },
            value: { type: Schema.Types.Mixed, required: true },
            color: { type: String, required: true }
        }]
    },
    overallMatch: { type: Number, required: true },
    compatibility: {
        visionAlignment: { type: Number, required: true },
        coreValues: { type: Number, required: true },
        businessGoals: { type: Number, required: true }
    },
    scoringBreakdown: [{
        label: { type: String, required: true },
        score: { type: Number, required: true },
        description: { type: String, required: true }
    }],
    strengths: [{
        area: { type: String, required: true },
        score: { type: Number, required: true },
        description: { type: String, required: true }
    }],
    weaknesses: [{
        area: { type: String, required: true },
        score: { type: Number, required: true },
        description: { type: String, required: true }
    }],
    risks: {
        marketFitRisk: {
            level: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
            description: { type: String, required: true },
            impactAreas: [{ type: String, required: true }]
        },
        operationalRisk: {
            level: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
            description: { type: String, required: true },
            impactAreas: [{ type: String, required: true }]
        },
        riskHeatmap: [{
            risk: { type: String, required: true },
            severity: { type: String, required: true },
            probability: { type: Number, required: true },
            impact: { type: Number, required: true }
        }]
    },
    riskMitigationRecommendations: [{
        text: { type: String, required: true },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
        timeline: { type: String, enum: ['Immediate', 'Short-term', 'Medium-term', 'Long-term'], required: true }
    }],
    improvementAreas: {
        strategicFocus: { type: String, required: true },
        communication: { type: String, required: true },
        growthMetrics: { type: String, required: true },
        actions: {
            strategicFocus: [{ type: String, required: true }],
            communication: [{ type: String, required: true }],
            growthMetrics: [{ type: String, required: true }]
        }
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

BeliefSystemAnalysisSchema.index({ startupId: 1, investorId: 1, perspective: 1 });
BeliefSystemAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BeliefSystemAnalysisModel = mongoose.model<BeliefSystemAnalysis>('BeliefSystemAnalysis', BeliefSystemAnalysisSchema);

export default BeliefSystemAnalysisModel;