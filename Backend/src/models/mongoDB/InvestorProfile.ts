import mongoose, { Schema, Document } from 'mongoose';

export interface InvestorProfileDocument extends Document {
    userId: string;
    industriesOfInterest: string[];
    preferredStages: string[];
    ticketSize: string;
    investmentCriteria: string[];
    pastInvestments: string;
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
    industriesOfInterest: {
        type: [String],
        required: true
    },
    preferredStages: {
        type: [String],
        required: true
    },
    ticketSize: {
        type: String
    },
    investmentCriteria: {
        type: [String]
    },
    pastInvestments: {
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

const InvestorProfile = mongoose.model<InvestorProfileDocument>('InvestorProfile', InvestorProfileSchema);
export { InvestorProfile };