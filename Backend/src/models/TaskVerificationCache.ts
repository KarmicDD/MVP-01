import mongoose, { Schema, Document } from 'mongoose';

export interface TaskVerificationCache extends Document {
    userId: string;
    taskId: string;
    result: {
        completed: boolean;
        message: string;
        nextSteps?: string[];
    };
    createdAt: Date;
    expiresAt: Date;
    dataTimestamp: Date; // Timestamp of user data when verification was performed
    dataDependencies: {
        profileUpdated?: Date;
        documentsUpdated?: Date;
        questionnairesUpdated?: Date;
        financialsUpdated?: Date;
        matchesUpdated?: Date;
    };
}

const TaskVerificationCacheSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    taskId: {
        type: String,
        required: true,
        index: true
    },
    result: {
        completed: {
            type: Boolean,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        nextSteps: {
            type: [String]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
    },
    dataTimestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    dataDependencies: {
        profileUpdated: {
            type: Date
        },
        documentsUpdated: {
            type: Date
        },
        questionnairesUpdated: {
            type: Date
        },
        financialsUpdated: {
            type: Date
        },
        matchesUpdated: {
            type: Date
        }
    }
});

// Create a compound index for faster lookups
TaskVerificationCacheSchema.index({ userId: 1, taskId: 1 }, { unique: true });

// Create TTL index to automatically delete expired documents
TaskVerificationCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TaskVerificationCacheModel = mongoose.model<TaskVerificationCache>('TaskVerificationCache', TaskVerificationCacheSchema);
export default TaskVerificationCacheModel;
