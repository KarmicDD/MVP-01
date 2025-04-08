import mongoose, { Schema, Document } from 'mongoose';

// Interface for social links
interface SocialLink {
    platform: string;
    url: string;
}

// Interface for team members
interface TeamMember {
    name: string;
    role: string;
    bio?: string;
}

// Interface for investment history
interface Investment {
    companyName: string;
    amount?: string;
    date?: string;
    stage?: string;
    outcome?: string;
}

// Extended profile interface
export interface ExtendedProfile extends Document {
    userId: string;            // Reference to PostgreSQL User.user_id
    avatarUrl?: string;
    socialLinks: SocialLink[];
    teamMembers?: TeamMember[];
    investmentHistory?: Investment[];
    createdAt: Date;
    updatedAt: Date;
}

// Schema for social links
const SocialLinkSchema = new Schema({
    platform: String,
    url: String
});

// Schema for team members
const TeamMemberSchema = new Schema({
    name: String,
    role: String,
    bio: String
});

// Schema for investment history
const InvestmentSchema = new Schema({
    companyName: String,
    amount: String,
    date: String,
    stage: String,
    outcome: String
});

// Extended profile schema
const ExtendedProfileSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    avatarUrl: String,
    socialLinks: [SocialLinkSchema],
    teamMembers: [TeamMemberSchema],
    investmentHistory: [InvestmentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const ExtendedProfileModel = mongoose.model<ExtendedProfile>('ExtendedProfile', ExtendedProfileSchema);
export default ExtendedProfileModel;
