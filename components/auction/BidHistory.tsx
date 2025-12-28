'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface Bid {
    _id: string;
    bidder: { username: string };
    amount: number;
    timestamp: string;
    isWinning: boolean;
}

interface BidHistoryProps {
    auctionId: string;
    refreshTrigger?: number;
}

export default function BidHistory({ auctionId, refreshTrigger = 0 }: BidHistoryProps) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const res = await fetch(`/api/bids/auction/${auctionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBids(data.bids);
                }
            } catch (error) {
                console.error('Failed to fetch bids:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBids();
    }, [auctionId, refreshTrigger]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                ))}
            </div>
        );
    }

    if (bids.length === 0) {
        return <p className="text-muted-foreground text-center py-4">No bids yet</p>;
    }

    return (
        <div className="space-y-2">
            {bids.map((bid, index) => (
                <div
                    key={bid._id}
                    className={`flex justify-between items-center p-3 rounded transition-colors ${index === 0
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted'
                        }`}
                >
                    <div>
                        <p className="font-medium">{bid.bidder.username}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(bid.timestamp)}</p>
                    </div>
                    <p className={`font-bold ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                        {formatCurrency(bid.amount)}
                    </p>
                </div>
            ))}
        </div>
    );
}
