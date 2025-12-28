import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import User from '@/lib/db/User';
import Auction from '@/lib/db/Auction';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const totalUsers = await User.countDocuments();
        const totalAuctions = await Auction.countDocuments();
        const activeAuctions = await Auction.countDocuments({ status: 'active' });
        const completedAuctions = await Auction.countDocuments({ status: 'sold' });

        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('username email createdAt');

        const recentAuctions = await Auction.find()
            .sort('-createdAt')
            .limit(5)
            .populate('seller', 'username')
            .select('title currentPrice status createdAt');

        return NextResponse.json({
            stats: {
                totalUsers,
                totalAuctions,
                activeAuctions,
                completedAuctions,
            },
            recentUsers,
            recentAuctions,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
