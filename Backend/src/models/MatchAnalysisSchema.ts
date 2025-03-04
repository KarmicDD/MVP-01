import mongoose, { Schema, Document } from 'mongoose';

export interface MatchAnalysis extends Document {
    startupId: string;
    investorId: string;
    overallScore: number;
    breakdown: {
        missionAlignment: number;
        investmentPhilosophy: number;
        sectorFocus: number;
        fundingStageAlignment: number;
        valueAddMatch: number;
    };
    insights: string[];
    createdAt: Date;
    expiresAt?: Date; // Optional: analyses could expire after certain time
}

const MatchAnalysisSchema: Schema = new Schema({
    startupId: {
        type: String,
        required: true,
        index: true
    },
    investorId: {
        type: String,
        required: true,
        index: true
    },
    overallScore: {
        type: Number,
        required: true,
        index: true // For sorting by score
    },
    breakdown: {
        missionAlignment: Number,
        investmentPhilosophy: Number,
        sectorFocus: Number,
        fundingStageAlignment: Number,
        valueAddMatch: Number
    },
    insights: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: Date
});

// Compound index for faster lookups of specific startup-investor pairs
MatchAnalysisSchema.index({ startupId: 1, investorId: 1 }, { unique: true });

const MatchAnalysisModel = mongoose.model<MatchAnalysis>('MatchAnalysis', MatchAnalysisSchema);
export default MatchAnalysisModel;