import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
    userId: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description?: string;
    documentType: 'pitch_deck' | 'financial' | 'other';
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    documentType: {
        type: String,
        enum: ['pitch_deck', 'financial', 'other'],
        default: 'other'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
