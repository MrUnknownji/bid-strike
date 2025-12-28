import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import User from '@/lib/db/User';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const query = search
            ? {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }
            : {};

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('username email role isActive isBanned createdAt rating totalAuctionsListed totalAuctionsWon')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        const { userId, action } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
        }

        let update = {};
        switch (action) {
            case 'ban':
                update = { isBanned: true };
                break;
            case 'unban':
                update = { isBanned: false };
                break;
            case 'makeAdmin':
                update = { role: 'admin' };
                break;
            case 'removeAdmin':
                update = { role: 'user' };
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(userId, update, { new: true })
            .select('username email role isBanned');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated', user });
    } catch (error) {
        console.error('Admin update user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
