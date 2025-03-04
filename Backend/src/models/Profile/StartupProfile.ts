import mongoose, { Schema, Document } from 'mongoose';

export interface StartupProfile extends Document {
    userId: string;            // Reference to PostgreSQL User.user_id
    companyName: string;
    industry: string;
    fundingStage: string;
    employeeCount?: string;
    location?: string;
    pitch?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StartupProfileSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    companyName: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true,
        index: true // Index for matching queries
    },
    fundingStage: {
        type: String,
        required: true,
        index: true // Index for matching queries
    },
    employeeCount: String,
    location: String,
    pitch: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const StartupProfileModel = mongoose.model<StartupProfile>('StartupProfile', StartupProfileSchema);
export default StartupProfileModel;