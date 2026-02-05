import Auction from '@/lib/db/Auction';

export async function updateAuctionStatuses() {
    const now = new Date();
    try {
        await Auction.updateMany(
            { status: 'scheduled', startTime: { $lte: now }, endTime: { $gt: now } },
            { status: 'active' }
        );
        await Auction.updateMany(
            { status: 'active', endTime: { $lte: now } },
            { status: 'ended' }
        );
    } catch (error) {
        console.error('Error updating auction statuses:', error);
    }
}
