import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
    type: 'contact' | 'suggestion';
    message: string;
    email?: string;
    userId?: string;
    context?: string; // e.g. 'category-suggestion'
    status: 'new' | 'read' | 'archived';
    createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
    type: { type: String, required: true, enum: ['contact', 'suggestion'] },
    message: { type: String, required: true },
    email: String,
    userId: String,
    context: String,
    status: { type: String, default: 'new', enum: ['new', 'read', 'archived'] },
}, { timestamps: true });

const Feedback: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
