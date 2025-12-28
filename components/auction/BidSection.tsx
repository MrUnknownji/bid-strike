'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';

interface BidSectionProps {
    auctionId: string;
    currentPrice: number;
    bidIncrement: number;
    isEnded: boolean;
    onBidPlaced?: () => void;
}

export default function BidSection({
    auctionId,
    currentPrice,
    bidIncrement,
    isEnded,
    onBidPlaced,
}: BidSectionProps) {
    const minBid = currentPrice + bidIncrement;
    const [bidAmount, setBidAmount] = useState(minBid.toString());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount < minBid) {
            setError(`Minimum bid is ${formatCurrency(minBid)}`);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Please login to place a bid');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ auctionId, amount }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to place bid');
                return;
            }

            setSuccess('Bid placed successfully!');
            setBidAmount((amount + bidIncrement).toString());
            onBidPlaced?.();
        } catch {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEnded) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">This auction has ended</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Place Your Bid</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-2 mb-4 text-sm text-destructive bg-destructive/10 rounded">{error}</div>
                )}
                {success && (
                    <div className="p-2 mb-4 text-sm text-primary bg-primary/10 rounded">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>
                            Current: {formatCurrency(currentPrice)} | Min: {formatCurrency(minBid)}
                        </Label>
                        <Input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={minBid}
                            step="0.01"
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Placing...' : 'Place Bid'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
