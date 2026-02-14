import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILocation {
    city?: string;
    state?: string;
    country?: string;
}

export interface IShippingInfo {
    available: boolean;
    cost?: number;
    estimatedDays?: number;
}

export interface IAuction extends Document {
    title: string;
    description: string;
    category?: Types.ObjectId;
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
    images: string[];
    seller: Types.ObjectId;
    startingPrice: number;
    reservePrice?: number;
    currentPrice: number;
    buyNowPrice?: number;
    bidIncrement: number;
    startTime: Date;
    endTime: Date;
    status: 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'sold';
    isFeatured: boolean;
    tags: string[];
    location?: ILocation;
    shippingInfo?: IShippingInfo;
    totalBids: number;
    viewCount: number;
    watchCount: number;
    winner?: Types.ObjectId;
    autoExtend: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>({
    city: String,
    state: String,
    country: String,
}, { _id: false });

const ShippingInfoSchema = new Schema<IShippingInfo>({
    available: { type: Boolean, default: false },
    cost: Number,
    estimatedDays: Number,
}, { _id: false });

const AuctionSchema = new Schema<IAuction>({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], default: 'good' },
    images: [String],
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startingPrice: { type: Number, required: true, min: 0 },
    reservePrice: { type: Number, min: 0 },
    currentPrice: { type: Number, default: 0 },
    buyNowPrice: { type: Number, min: 0 },
    bidIncrement: { type: Number, default: 1, min: 1 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled', 'sold'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    location: LocationSchema,
    shippingInfo: ShippingInfoSchema,
    totalBids: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    watchCount: { type: Number, default: 0 },
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    autoExtend: { type: Boolean, default: false },
}, { timestamps: true });

AuctionSchema.index({ status: 1, endTime: 1 });
AuctionSchema.index({ seller: 1 });
AuctionSchema.index({ category: 1 });
AuctionSchema.index({ currentPrice: 1 });

const Auction: Model<IAuction> = mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema);

export default Auction;
