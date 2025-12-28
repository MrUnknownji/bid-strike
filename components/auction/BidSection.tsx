'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/context/AuthContext';
import { Zap, Clock } from 'lucide-react';

interface BidSectionProps {
    auctionId: string;
    currentPrice: number;
    bidIncrement: number;
    isEnded: boolean;
    startTime: string;
    onBidPlaced?: () => void;
    onPriceUpdate?: (newPrice: number) => void;
}

export default function BidSection({
    auctionId,
    currentPrice,
    bidIncrement,
    isEnded,
    startTime,
    onBidPlaced,
    onPriceUpdate,
}: BidSectionProps) {
    const { user } = useAuth();
    const [price, setPrice] = useState(currentPrice);
    const minBid = price + bidIncrement;
    const [bidAmount, setBidAmount] = useState(minBid.toString());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastBidder, setLastBidder] = useState<string | null>(null);
    const [autoBidEnabled, setAutoBidEnabled] = useState(false);
    const [maxAutoBid, setMaxAutoBid] = useState('');

    const isStarted = new Date(startTime) <= new Date();
    const isActive = isStarted && !isEnded;

    const handleBidUpdate = useCallback((bid: { amount: number; bidder: string }) => {
        setPrice(bid.amount);
        setBidAmount((bid.amount + bidIncrement).toString());
        setLastBidder(bid.bidder);
        onPriceUpdate?.(bid.amount);

        if (user && bid.bidder !== user.username) {
            setSuccess('');
            setError(`Outbid! ${bid.bidder} bid ${formatCurrency(bid.amount)}`);
        }
    }, [bidIncrement, onPriceUpdate, user]);

    const { emitBid } = useSocket({
        auctionId,
        onBidUpdate: handleBidUpdate,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isStarted) {
            setError('Auction has not started yet');
            return;
        }

        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount < minBid) {
            setError(`Minimum bid is ${formatCurrency(minBid)}`);
            return;
        }

        const maxAmount = autoBidEnabled ? parseFloat(maxAutoBid) : undefined;
        if (autoBidEnabled && (!maxAmount || maxAmount < amount)) {
            setError('Max auto-bid must be greater than your bid');
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
                body: JSON.stringify({
                    auctionId,
                    amount,
                    maxAutoBidAmount: maxAmount,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to place bid');
                return;
            }

            emitBid({ amount: data.currentPrice || amount, bidder: user?.username || 'Anonymous' });

            if (data.outbid) {
                setError('Bid placed but you were outbid by auto-bid!');
                setPrice(data.currentPrice);
                setBidAmount((data.currentPrice + bidIncrement).toString());
            } else {
                setSuccess(autoBidEnabled ? 'Auto-bid set successfully!' : 'Bid placed successfully!');
                setPrice(amount);
                setBidAmount((amount + bidIncrement).toString());
            }

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

    if (!isStarted) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Place Your Bid</CardTitle>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-xs text-amber-500 font-medium">Upcoming</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="text-center py-6">
                    <p className="text-muted-foreground mb-2">Bidding not yet open</p>
                    <p className="text-sm text-muted-foreground">
                        Starting price: {formatCurrency(currentPrice)}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Place Your Bid</CardTitle>
                    {isActive && (
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-muted-foreground">Live</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-2 mb-4 text-sm text-destructive bg-destructive/10 rounded">{error}</div>
                )}
                {success && (
                    <div className="p-2 mb-4 text-sm text-primary bg-primary/10 rounded">{success}</div>
                )}

                {lastBidder && (
                    <p className="text-xs text-muted-foreground mb-3">
                        Last bid by <span className="font-medium">{lastBidder}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>
                            Current: {formatCurrency(price)} | Min: {formatCurrency(minBid)}
                        </Label>
                        <Input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={minBid}
                            step="0.01"
                        />
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => setAutoBidEnabled(!autoBidEnabled)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${autoBidEnabled
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Zap className={`h-4 w-4 ${autoBidEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="text-sm font-medium">Auto-Bid</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full transition-colors ${autoBidEnabled ? 'bg-primary' : 'bg-muted'}`}>
                                <div className={`w-3 h-3 rounded-full bg-white m-0.5 transition-transform ${autoBidEnabled ? 'translate-x-4' : ''}`} />
                            </div>
                        </button>

                        {autoBidEnabled && (
                            <div className="space-y-2 pl-1">
                                <Label className="text-xs">Max Auto-Bid Amount</Label>
                                <Input
                                    type="number"
                                    value={maxAutoBid}
                                    onChange={(e) => setMaxAutoBid(e.target.value)}
                                    placeholder={`e.g. ${(minBid * 2).toFixed(2)}`}
                                    min={minBid}
                                    step="0.01"
                                />
                                <p className="text-xs text-muted-foreground">
                                    System will auto-bid up to this amount when you're outbid
                                </p>
                            </div>
                        )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Placing...' : autoBidEnabled ? 'Set Auto-Bid' : 'Place Bid'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
