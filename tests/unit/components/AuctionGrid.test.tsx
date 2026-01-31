import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import AuctionGrid from '@/components/auction/AuctionGrid';

const mockAuctions = [
    {
        _id: '1',
        title: 'Test Auction 1',
        images: ['/test1.jpg'],
        currentPrice: 100,
        endTime: new Date(Date.now() + 100000).toISOString(),
        totalBids: 5,
        status: 'active',
        seller: { username: 'seller1' },
    },
    {
        _id: '2',
        title: 'Test Auction 2',
        images: ['/test2.jpg'],
        currentPrice: 200,
        endTime: new Date(Date.now() + 200000).toISOString(),
        totalBids: 10,
        status: 'active',
        seller: { username: 'seller2' },
    },
];

describe('AuctionGrid', () => {
    it('renders auctions correctly', () => {
        const { getByText } = render(<AuctionGrid auctions={mockAuctions} />);

        expect(getByText('Test Auction 1')).toBeInTheDocument();
        expect(getByText('Test Auction 2')).toBeInTheDocument();
        expect(getByText('seller1')).toBeInTheDocument();
        expect(getByText('seller2')).toBeInTheDocument();
    });

    it('renders empty state when no auctions', () => {
        const { getByText } = render(<AuctionGrid auctions={[]} />);

        expect(getByText('No auctions found')).toBeInTheDocument();
    });

    it('renders loading state opacity', () => {
        const { container } = render(<AuctionGrid auctions={mockAuctions} isLoading={true} />);

        const gridDiv = container.firstChild;
        expect(gridDiv).toHaveClass('opacity-40');
    });
});
