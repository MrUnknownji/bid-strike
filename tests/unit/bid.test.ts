import { expect, test, describe, mock, beforeEach } from 'bun:test';
import { NextRequest } from 'next/server';

// 1. Setup Mocks
const mockBidFindOne = mock(() => Promise.resolve({
    bidder: 'prev-winner-id',
    toString: () => 'prev-bid-doc'
}));
const mockBidUpdateMany = mock(() => Promise.resolve());
const mockBidFindOneAndUpdate = mock(() => Promise.resolve({
    bidder: 'prev-winner-id',
    toString: () => 'prev-bid-doc'
}));
const mockBidCreate = mock((data: Record<string, unknown>) => Promise.resolve({ ...data, _id: 'new-bid-id' }));
const mockBidFind = mock(() => ({
    sort: () => Promise.resolve([])
}));

mock.module('@/lib/db/Bid', () => ({
    default: {
        findOne: mockBidFindOne,
        updateMany: mockBidUpdateMany,
        create: mockBidCreate,
        findOneAndUpdate: mockBidFindOneAndUpdate,
        find: mockBidFind,
    }
}));

const mockAuctionFindById = mock(() => Promise.resolve({
    _id: 'auction-123',
    status: 'active',
    endTime: new Date(Date.now() + 100000), // Future date
    seller: 'seller-id',
    currentPrice: 100,
    bidIncrement: 10,
    title: 'Test Auction',
    toString: () => 'auction-doc'
}));
const mockAuctionFindByIdAndUpdate = mock(() => Promise.resolve());

mock.module('@/lib/db/Auction', () => ({
    default: {
        findById: mockAuctionFindById,
        findByIdAndUpdate: mockAuctionFindByIdAndUpdate,
    }
}));

mock.module('@/lib/db/database', () => ({
    default: async () => {},
    connectDB: async () => {},
}));

mock.module('@/lib/middleware/auth', () => ({
    getTokenFromRequest: () => ({ userId: 'user-123' }),
}));

const notifyOutbidMock = mock(() => Promise.resolve());
mock.module('@/lib/services/notificationService', () => ({
    notifyOutbid: notifyOutbidMock,
}));

describe('Bid API POST', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let POST: any;

    beforeEach(async () => {
        // Reset mocks
        mockBidFindOne.mockClear();
        mockBidUpdateMany.mockClear();
        mockBidFindOneAndUpdate.mockClear();
        mockBidCreate.mockClear();
        mockAuctionFindById.mockClear();
        mockAuctionFindByIdAndUpdate.mockClear();
        notifyOutbidMock.mockClear();

        // Import module
        // We use a slight delay or just verify if re-import works,
        // but typically modules are cached.
        // Since we mock modules before, it should be fine.
        const routeModule = await import('@/app/api/bids/route');
        POST = routeModule.POST;
    });

    test('should optimize sequential DB calls using findOneAndUpdate', async () => {
        const req = new NextRequest('http://localhost:3000/api/bids', {
            method: 'POST',
            body: JSON.stringify({
                auctionId: 'auction-123',
                amount: 150
            })
        });

        const res = await POST(req);

        // If the request fails, logging the error might help
        if (res.status !== 201) {
            const error = await res.json();
            console.error('API Error:', error);
        }

        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.message).toBe('Bid placed successfully');

        // Verify the optimization
        // These assertions confirm we switched to findOneAndUpdate
        expect(mockBidFindOneAndUpdate).toHaveBeenCalled();
        expect(mockBidFindOne).not.toHaveBeenCalled();
        expect(mockBidUpdateMany).not.toHaveBeenCalled();

        // Verify notification was sent
        expect(notifyOutbidMock).toHaveBeenCalled();
    });
});
