import mongoose, { Schema, Document } from 'mongoose';

export interface AITaskCache extends Document {
    userId: string;
    role: string;
    tasksGenerated: boolean;
    lastGeneratedAt: Date;
    expiresAt: Date;
}

const AITaskCacheSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    role: {
        type: String,
        required: true,
        enum: ['startup', 'investor']
    },
    tasksGenerated: {
        type: Boolean,
        default: true
    },
    lastGeneratedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
    }
});

// Create TTL index to automatically delete expired documents
AITaskCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AITaskCacheModel = mongoose.model<AITaskCache>('AITaskCache', AITaskCacheSchema);
export default AITaskCacheModel;
