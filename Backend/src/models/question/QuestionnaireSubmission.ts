import mongoose, { Schema, Document } from 'mongoose';

export interface QuestionnaireSubmission extends Document {
    userId: string;            // Reference to PostgreSQL User.user_id
    userRole: string;          // 'startup' or 'investor'
    responses: Map<string, any>; // Question ID to response mapping
    status: string;            // 'draft' or 'submitted'
    analysisResults: {
        categories: Record<string, number>;
        overallProfile: string[];
        matchPreferences: Record<string, any>;
    };
    createdAt: Date;
    updatedAt: Date;
}

const QuestionnaireSubmissionSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userRole: {
        type: String,
        required: true,
        enum: ['startup', 'investor']
    },
    responses: {
        type: Map,
        of: Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['draft', 'submitted'],
        default: 'draft'
    },
    analysisResults: {
        categories: {
            type: Map,
            of: Number,
            default: {}
        },
        overallProfile: {
            type: [String],
            default: []
        },
        matchPreferences: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {}
        }
    }
}, {
    timestamps: true
});

// Create a compound index for userId and userRole
QuestionnaireSubmissionSchema.index({ userId: 1, userRole: 1 }, { unique: true });

const QuestionnaireSubmissionModel = mongoose.model<QuestionnaireSubmission>('QuestionnaireSubmission', QuestionnaireSubmissionSchema);

export default QuestionnaireSubmissionModel;