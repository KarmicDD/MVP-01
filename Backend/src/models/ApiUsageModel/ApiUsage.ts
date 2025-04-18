import mongoose from 'mongoose';

const ApiUsageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    compatibilityRequestCount: {
        type: Number,
        default: 0
    },
    beliefSystemRequestCount: {
        type: Number,
        default: 0
    },
    financialAnalysisRequestCount: {
        type: Number,
        default: 0
    },
    recommendationRequestCount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastReset: {
        type: Date,
        default: Date.now
    }
});

const ApiUsageModel = mongoose.model('ApiUsage', ApiUsageSchema);
export default ApiUsageModel;