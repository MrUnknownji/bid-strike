import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type NotificationType =
    | 'bid_placed'
    | 'outbid'
    | 'auction_won'
    | 'auction_lost'
    | 'auction_ending'
    | 'payment_received'
    | 'new_message';

export interface INotification extends Document {
    user: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    relatedAuction?: Types.ObjectId;
    relatedBid?: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['bid_placed', 'outbid', 'auction_won', 'auction_lost', 'auction_ending', 'payment_received', 'new_message'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedAuction: { type: Schema.Types.ObjectId, ref: 'Auction' },
    relatedBid: { type: Schema.Types.ObjectId, ref: 'Bid' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ user: 1, isRead: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
