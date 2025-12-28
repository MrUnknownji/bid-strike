import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBid extends Document {
    auction: Types.ObjectId;
    bidder: Types.ObjectId;
    amount: number;
    isAutoBid: boolean;
    maxAutoBidAmount?: number;
    timestamp: Date;
    isWinning: boolean;
    ipAddress?: string;
    createdAt: Date;
}

const BidSchema = new Schema<IBid>({
    auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    isAutoBid: { type: Boolean, default: false },
    maxAutoBidAmount: Number,
    timestamp: { type: Date, default: Date.now },
    isWinning: { type: Boolean, default: false },
    ipAddress: String,
}, { timestamps: true });

BidSchema.index({ auction: 1, amount: -1 });
BidSchema.index({ bidder: 1 });

const Bid: Model<IBid> = mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);

export default Bid;
