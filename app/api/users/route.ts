import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import User from '@/lib/db/User';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(payload.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
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
        const body = await request.json();
        const { firstName, lastName, phone, address, avatar } = body;

        const user = await User.findByIdAndUpdate(
            payload.userId,
            { firstName, lastName, phone, address, avatar },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
