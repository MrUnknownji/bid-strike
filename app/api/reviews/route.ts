import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Review from '@/lib/db/Review';
import User from '@/lib/db/User';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const total = await Review.countDocuments({ reviewee: userId });
        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'username avatar')
            .populate('auction', 'title images')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit);

        const user = await User.findById(userId).select('rating totalReviews');

        return NextResponse.json({
            reviews,
            averageRating: user?.rating || 0,
            totalReviews: user?.totalReviews || 0,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
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
        const { revieweeId, auctionId, rating, comment } = body;

        if (!revieweeId || !auctionId || !rating) {
            return NextResponse.json(
                { error: 'Reviewee, auction and rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
        }

        const existing = await Review.findOne({
            reviewer: payload.userId,
            auction: auctionId,
        });

        if (existing) {
            return NextResponse.json(
                { error: 'You already reviewed this transaction' },
                { status: 400 }
            );
        }

        const review = await Review.create({
            reviewer: payload.userId,
            reviewee: revieweeId,
            auction: auctionId,
            rating,
            comment,
        });

        const reviews = await Review.find({ reviewee: revieweeId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await User.findByIdAndUpdate(revieweeId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });

        return NextResponse.json({ message: 'Review submitted', review }, { status: 201 });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

