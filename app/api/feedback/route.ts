import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Feedback from '@/lib/db/Feedback';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, message, email, context } = body;

        if (!type || !message) {
            return NextResponse.json(
                { error: 'Type and message are required' },
                { status: 400 }
            );
        }

        const payload = getTokenFromRequest(request);

        await connectDB();

        const feedback = await Feedback.create({
            type,
            message,
            email,
            context,
            userId: payload?.userId,
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error('Feedback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
