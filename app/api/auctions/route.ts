import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Auction from '@/lib/db/Auction';
import Category from '@/lib/db/Category';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || '-createdAt';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const condition = searchParams.get('condition');

        const query: Record<string, unknown> = {};

        if (status && status !== 'all') {
            query.status = status;
        } else {
            query.status = { $in: ['active', 'scheduled'] };
        }

        if (subcategory) {
            query.category = subcategory;
        } else if (category) {
            const subcategories = await Category.find({ parent: category }).select('_id');
            const categoryIds = [category, ...subcategories.map(s => s._id)];
            query.category = { $in: categoryIds };
        }

        if (minPrice || maxPrice) {
            query.currentPrice = {};
            if (minPrice) (query.currentPrice as Record<string, number>).$gte = parseFloat(minPrice);
            if (maxPrice) (query.currentPrice as Record<string, number>).$lte = parseFloat(maxPrice);
        }

        if (condition) {
            query.condition = condition;
        }

        if (search) {
            const categoryMatches = await Category.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orConditions: any[] = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];

            if (categoryMatches.length > 0) {
                orConditions.push({ category: { $in: categoryMatches.map(c => c._id) } });
            }

            query.$or = orConditions;
        }

        const total = await Auction.countDocuments(query);
        const auctions = await Auction.find(query)
            .populate('seller', 'username avatar rating')
            .populate('category', 'name slug parent')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            auctions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get auctions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();

        const {
            title, description, category, condition, images,
            startingPrice, reservePrice, buyNowPrice, bidIncrement,
            startTime, endTime, tags, location, shippingInfo, autoExtend
        } = body;

        if (!title || !description || !startingPrice || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Title, description, startingPrice, startTime and endTime are required' },
                { status: 400 }
            );
        }

        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        let status = 'draft';
        if (start <= now && end > now) status = 'active';
        else if (start > now) status = 'scheduled';

        const auction = await Auction.create({
            title,
            description,
            category,
            condition,
            images: images || [],
            seller: payload.userId,
            startingPrice,
            reservePrice,
            currentPrice: startingPrice,
            buyNowPrice,
            bidIncrement: bidIncrement || 1,
            startTime: start,
            endTime: end,
            status,
            tags: tags || [],
            location,
            shippingInfo,
            autoExtend: autoExtend || false,
        });

        return NextResponse.json({ message: 'Auction created', auction }, { status: 201 });
    } catch (error) {
        console.error('Create auction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
