import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Category from '@/lib/db/Category';
import { getTokenFromRequest } from '@/lib/middleware/auth';
import { slugify } from '@/lib/utils/formatters';

export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .lean();

        const parentCategories = categories.filter(c => !c.parent);
        const result = parentCategories.map(parent => ({
            _id: parent._id,
            name: parent.name,
            slug: parent.slug,
            subcategories: categories.filter(
                c => c.parent && c.parent.toString() === parent._id.toString()
            ).map(sub => ({
                _id: sub._id,
                name: sub.name,
                slug: sub.slug,
            })),
        }));

        return NextResponse.json({ categories: result });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        const { name, description, image, parent, order } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const slug = slugify(name);

        const existing = await Category.findOne({ $or: [{ name }, { slug }] });
        if (existing) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            parent,
            order: order || 0,
        });

        return NextResponse.json({ message: 'Category created', category }, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
