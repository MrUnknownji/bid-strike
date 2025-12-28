import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IShippingAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

export interface ITransaction extends Document {
    auction: Types.ObjectId;
    buyer: Types.ObjectId;
    seller: Types.ObjectId;
    amount: number;
    paymentMethod?: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    stripePaymentId?: string;
    stripeSessionId?: string;
    shippingAddress?: IShippingAddress;
    trackingNumber?: string;
    deliveryStatus: 'pending' | 'shipped' | 'delivered';
    createdAt: Date;
    updatedAt: Date;
}

const ShippingAddressSchema = new Schema<IShippingAddress>({
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
}, { _id: false });

const TransactionSchema = new Schema<ITransaction>({
    auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: String,
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    stripePaymentId: String,
    stripeSessionId: String,
    shippingAddress: ShippingAddressSchema,
    trackingNumber: String,
    deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
}, { timestamps: true });

TransactionSchema.index({ buyer: 1 });
TransactionSchema.index({ seller: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
