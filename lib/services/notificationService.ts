import connectDB from '@/lib/db/database';
import Notification from '@/lib/db/Notification';
import { Types } from 'mongoose';

type NotificationType = 'bid' | 'outbid' | 'auction_won' | 'auction_ended' | 'system';

interface CreateNotificationParams {
    userId: string | Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    auctionId?: string | Types.ObjectId;
}

export async function createNotification({
    userId,
    type,
    title,
    message,
    auctionId,
}: CreateNotificationParams) {
    await connectDB();

    return Notification.create({
        user: userId,
        type,
        title,
        message,
        relatedAuction: auctionId,
    });
}

export async function notifyBidPlaced(
    bidderId: string,
    auctionId: string,
    auctionTitle: string,
    amount: number
) {
    return createNotification({
        userId: bidderId,
        type: 'bid',
        title: 'Bid Placed Successfully',
        message: `Your bid of $${amount.toFixed(2)} on "${auctionTitle}" has been placed.`,
        auctionId,
    });
}

export async function notifyOutbid(
    previousBidderId: string,
    auctionId: string,
    auctionTitle: string,
    newAmount: number
) {
    return createNotification({
        userId: previousBidderId,
        type: 'outbid',
        title: 'You\'ve Been Outbid!',
        message: `Someone placed a higher bid of $${newAmount.toFixed(2)} on "${auctionTitle}".`,
        auctionId,
    });
}

export async function notifyAuctionWon(
    winnerId: string,
    auctionId: string,
    auctionTitle: string,
    winningAmount: number
) {
    return createNotification({
        userId: winnerId,
        type: 'auction_won',
        title: 'Congratulations! You Won!',
        message: `You won "${auctionTitle}" for $${winningAmount.toFixed(2)}. Proceed to checkout to complete the purchase.`,
        auctionId,
    });
}

export async function notifyAuctionEnded(
    sellerId: string,
    auctionId: string,
    auctionTitle: string,
    sold: boolean,
    finalPrice?: number
) {
    const title = sold ? 'Your Auction Sold!' : 'Auction Ended';
    const message = sold
        ? `"${auctionTitle}" sold for $${finalPrice?.toFixed(2) || '0.00'}.`
        : `"${auctionTitle}" ended without any bids.`;

    return createNotification({
        userId: sellerId,
        type: 'auction_ended',
        title,
        message,
        auctionId,
    });
}

export async function notifySystem(userId: string, title: string, message: string) {
    return createNotification({
        userId,
        type: 'system',
        title,
        message,
    });
}
