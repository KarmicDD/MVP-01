import mongoose, { Schema, Document } from 'mongoose';
import { DashboardInsight } from '../services/AIInsightsService';

export interface AIInsightCache extends Document {
    userId: string;
    role: string;
    insights: DashboardInsight[];
    createdAt: Date;
    expiresAt: Date;
}

const AIInsightCacheSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        required: true,
        enum: ['startup', 'investor']
    },
    insights: {
        type: [Object],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
    }
});

// Create TTL index to automatically delete expired documents
AIInsightCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AIInsightCacheModel = mongoose.model<AIInsightCache>('AIInsightCache', AIInsightCacheSchema);
export default AIInsightCacheModel;
