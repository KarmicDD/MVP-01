import mongoose, { Schema, Document } from 'mongoose';

export interface MatchAnalysis extends Document {
    startupId: string;
    investorId: string;
    perspective: 'startup' | 'investor';
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
    expiresAt: Date;
}

const MatchAnalysisSchema = new mongoose.Schema({
    startupId: {
        type: String,
        required: true,
        index: true
    },
    investorId: {
        type: String,
        required: true,
        index: true
    }, perspective: {
        type: String,
        required: true,
        default: 'investor'
    },
    overallScore: {
        type: Number,
        required: true
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
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Create a compound index for faster lookups of specific startup-investor pairs with perspective
MatchAnalysisSchema.index({ startupId: 1, investorId: 1, perspective: 1 });

const MatchAnalysisModel = mongoose.model('MatchAnalysis', MatchAnalysisSchema);
export default MatchAnalysisModel;
