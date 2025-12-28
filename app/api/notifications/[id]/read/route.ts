import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Notification from '@/lib/db/Notification';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: payload.userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Marked as read', notification });
    } catch (error) {
        console.error('Mark read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
