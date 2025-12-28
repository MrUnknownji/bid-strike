import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent?: Types.ObjectId;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    image: String,
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
