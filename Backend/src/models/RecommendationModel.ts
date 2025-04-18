import mongoose, { Schema, Document } from 'mongoose';

export interface Recommendation {
    id: string;
    title: string;
    summary: string;
    details: string;
    category: 'strategic' | 'operational' | 'financial' | 'communication' | 'growth';
    priority: 'high' | 'medium' | 'low';
    confidence: number;
}

export interface RecommendationData extends Document {
    startupId: string;
    investorId: string;
    perspective: 'startup' | 'investor';
    recommendations: Recommendation[];
    precision: number;
    createdAt: Date;
    expiresAt: Date;
}

const RecommendationSchema = new mongoose.Schema({
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
    perspective: {
        type: String,
        enum: ['startup', 'investor'],
        required: true,
        default: 'investor'
    },
    recommendations: [{
        id: String,
        title: String,
        summary: String,
        details: String,
        category: {
            type: String,
            enum: ['strategic', 'operational', 'financial', 'communication', 'growth']
        },
        priority: {
            type: String,
            enum: ['high', 'medium', 'low']
        },
        confidence: Number
    }],
    precision: {
        type: Number,
        default: 90
    },
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

// Create a compound index for faster lookups
RecommendationSchema.index({ startupId: 1, investorId: 1, perspective: 1 });

const RecommendationModel = mongoose.model<RecommendationData>('Recommendation', RecommendationSchema);
export default RecommendationModel;
