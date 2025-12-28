import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: 'user' | 'admin';
    phone?: string;
    address?: IAddress;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    rating: number;
    totalReviews: number;
    totalAuctionsWon: number;
    totalAuctionsListed: number;
    likedAuctions: mongoose.Types.ObjectId[];
    watchlist: mongoose.Types.ObjectId[];
    isActive: boolean;
    isBanned: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
}, { _id: false });

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: String,
    lastName: String,
    avatar: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: String,
    address: AddressSchema,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalAuctionsWon: { type: Number, default: 0 },
    totalAuctionsListed: { type: Number, default: 0 },
    likedAuctions: [{ type: Schema.Types.ObjectId, ref: 'Auction' }],
    watchlist: [{ type: Schema.Types.ObjectId, ref: 'Auction' }],
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    lastLogin: Date,
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
