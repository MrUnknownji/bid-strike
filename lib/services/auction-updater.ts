import Auction from '@/lib/db/Auction';

export async function updateAuctionStatuses() {
    try {
        const now = new Date();
        const scheduled = await Auction.updateMany(
            { status: 'scheduled', startTime: { $lte: now }, endTime: { $gt: now } },
            { status: 'active' }
        );

        const ended = await Auction.updateMany(
            { status: 'active', endTime: { $lte: now } },
            { status: 'ended' }
        );

        if (scheduled.modifiedCount > 0 || ended.modifiedCount > 0) {
            console.log(`Background update: Activated ${scheduled.modifiedCount}, Ended ${ended.modifiedCount}`);
        }
        return { scheduled: scheduled.modifiedCount, ended: ended.modifiedCount };
    } catch (error) {
        console.error('Background update error:', error);
        throw error;
    }
}
