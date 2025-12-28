import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Auction from '@/lib/db/Auction';
import User from '@/lib/db/User';
import { getTokenFromRequest } from '@/lib/middleware/auth';
import { createCheckoutSession } from '@/lib/services/paymentService';

export async function POST(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { auctionId } = body;

        if (!auctionId) {
            return NextResponse.json({ error: 'Auction ID required' }, { status: 400 });
        }

        const auction = await Auction.findById(auctionId).populate('winner', 'email');
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (auction.status !== 'sold' && auction.status !== 'ended') {
            return NextResponse.json({ error: 'Auction is not ready for payment' }, { status: 400 });
        }

        if (auction.winner?.toString() !== payload.userId && auction.winner?._id?.toString() !== payload.userId) {
            return NextResponse.json({ error: 'Only the winner can pay for this auction' }, { status: 403 });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const baseUrl = request.headers.get('origin') || 'http://localhost:3000';

        const session = await createCheckoutSession({
            auctionId: auctionId,
            auctionTitle: auction.title,
            amount: auction.currentPrice,
            buyerEmail: user.email,
            successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&auction_id=${auctionId}`,
            cancelUrl: `${baseUrl}/checkout/failed?auction_id=${auctionId}`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Payment error:', error);
        const message = error instanceof Error ? error.message : 'Payment failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
