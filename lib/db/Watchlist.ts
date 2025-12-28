import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWatchlist extends Document {
    user: Types.ObjectId;
    auction: Types.ObjectId;
    createdAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
}, { timestamps: true });

WatchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

const Watchlist: Model<IWatchlist> = mongoose.models.Watchlist || mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);

export default Watchlist;
