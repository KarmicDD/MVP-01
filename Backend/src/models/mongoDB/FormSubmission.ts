import mongoose, { Schema, Document } from 'mongoose';

interface FormSubmission extends Document {
    userId: string;
    formId: string;
    responses: Map<string, any>;
    analysisReport: {
        score: number;
        insights: string[];
    };
    createdAt: Date;
}

const FormSubmissionSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    formId: {
        type: String,
        required: true
    },
    responses: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    analysisReport: {
        score: Number,
        insights: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FormModel = mongoose.model<FormSubmission>('FormSubmission', FormSubmissionSchema);
export default FormModel;