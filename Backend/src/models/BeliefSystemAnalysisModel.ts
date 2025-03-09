import mongoose, { Schema, Document } from 'mongoose';

export interface BeliefSystemAnalysis extends Document {
    startupId: string;
    investorId: string;
    perspective: 'startup' | 'investor';
    overallMatch: number;
    compatibility: {
        visionAlignment: number;
        coreValues: number;
        businessGoals: number;
    };
    risks: {
        marketFitRisk: {
            level: string;
            description: string;
        };
        operationalRisk: {
            level: string;
            description: string;
        };
    };
    riskMitigationRecommendations: string[];
    improvementAreas: {
        strategicFocus: string;
        communication: string;
        growthMetrics: string;
    };
    createdAt: Date;
    expiresAt: Date;
}

const BeliefSystemAnalysisSchema = new Schema<BeliefSystemAnalysis>({
    startupId: { type: String, required: true },
    investorId: { type: String, required: true },
    perspective: { type: String, enum: ['startup', 'investor'], required: true },
    overallMatch: { type: Number, required: true },
    compatibility: {
        visionAlignment: { type: Number, required: true },
        coreValues: { type: Number, required: true },
        businessGoals: { type: Number, required: true }
    },
    risks: {
        marketFitRisk: {
            level: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
            description: { type: String, required: true }
        },
        operationalRisk: {
            level: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
            description: { type: String, required: true }
        }
    },
    riskMitigationRecommendations: [{ type: String }],
    improvementAreas: {
        strategicFocus: { type: String, required: true },
        communication: { type: String, required: true },
        growthMetrics: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

// Create compound index for faster lookups
BeliefSystemAnalysisSchema.index({ startupId: 1, investorId: 1, perspective: 1 });

// Add TTL index to automatically delete expired documents
BeliefSystemAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BeliefSystemAnalysisModel = mongoose.model<BeliefSystemAnalysis>('BeliefSystemAnalysis', BeliefSystemAnalysisSchema);

export default BeliefSystemAnalysisModel;