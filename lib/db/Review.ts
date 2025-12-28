import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
    reviewer: Types.ObjectId;
    reviewee: Types.ObjectId;
    auction: Types.ObjectId;
    rating: number;
    comment?: string;
    response?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    response: String,
}, { timestamps: true });

ReviewSchema.index({ reviewee: 1 });
ReviewSchema.index({ reviewer: 1, auction: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
