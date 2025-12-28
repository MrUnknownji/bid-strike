import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Notification from '@/lib/db/Notification';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const notifications = await Notification.find({ user: payload.userId })
            .populate('relatedAuction', 'title images')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            user: payload.userId,
            isRead: false,
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        await Notification.updateMany(
            { user: payload.userId, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
