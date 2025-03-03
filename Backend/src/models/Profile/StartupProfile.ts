// models/mongoDB/StartupProfile.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface StartupProfileDocument extends Document {
    userId: string;
    companyName: string;
    industry: string;
    fundingStage: string;
    employeeCount: string;
    location: string;
    pitch: string;
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
        required: true
    },
    fundingStage: {
        type: String,
        required: true
    },
    employeeCount: {
        type: String
    },
    location: {
        type: String
    },
    pitch: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const StartupProfile = mongoose.model<StartupProfileDocument>('StartupProfile', StartupProfileSchema);
export { StartupProfile };