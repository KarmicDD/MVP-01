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
    lastReset: {
        type: Date,
        default: Date.now
    }
});

const ApiUsageModel = mongoose.model('ApiUsage', ApiUsageSchema);
export default ApiUsageModel;