import mongoose, { Schema, Document } from 'mongoose';

export interface InvestorProfile extends Document {
    userId: string;            // Reference to PostgreSQL User.user_id
    companyName: string;
    industriesOfInterest: string[];
    preferredStages: string[];
    ticketSize?: string;
    investmentCriteria?: string[];
    pastInvestments?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvestorProfileSchema: Schema = new Schema({
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
    industriesOfInterest: {
        type: [String],
        required: true,
        index: true // Index for matching queries
    },
    preferredStages: {
        type: [String],
        required: true,
        index: true // Index for matching queries
    },
    ticketSize: String,
    investmentCriteria: [String],
    pastInvestments: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const InvestorProfileModel = mongoose.model<InvestorProfile>('InvestorProfile', InvestorProfileSchema);
export default InvestorProfileModel;