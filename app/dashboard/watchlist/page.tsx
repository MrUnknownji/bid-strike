'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatters';
import { ArrowLeft, Eye, Clock, ImageOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Auction {
    _id: string;
    title: string;
    images: string[];
    currentPrice: number;
    endTime: string;
    status: string;
    totalBids: number;
}

export default function WatchlistPage() {
    const router = useRouter();
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('/api/user/watchlist', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setAuctions(data.auctions || []))
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [router]);

    const handleRemove = async (auctionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch('/api/user/watchlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ auctionId }),
        });

        if (res.ok) {
            setAuctions(prev => prev.filter(a => a._id !== auctionId));
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
            active: { variant: 'default', label: 'Ongoing' },
            scheduled: { variant: 'secondary', label: 'Upcoming' },
            ended: { variant: 'outline', label: 'Ended' },
        };
        const { variant, label } = config[status] || { variant: 'outline', label: status };
        return <Badge variant={variant}>{label}</Badge>;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Eye className="w-6 h-6 text-primary" />
                        Watchlist
                    </h1>
                    <p className="text-muted-foreground text-sm">Auctions you're watching</p>
                </div>
            </div>

            <div
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-50' : 'opacity-100'
                )}
            >
                {auctions.length === 0 && !isLoading ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Eye className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Watchlist empty</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Add auctions to your watchlist to track them
                            </p>
                            <Link href="/auctions">
                                <Button>Browse Auctions</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {auctions.map((auction) => (
                            <Card
                                key={auction._id}
                                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all group"
                                onClick={() => router.push(`/auctions/${auction._id}`)}
                            >
                                <div className="h-40 bg-muted relative overflow-hidden">
                                    {auction.images?.[0] ? (
                                        <img
                                            src={auction.images[0]}
                                            alt={auction.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <ImageOff className="w-6 h-6 mb-1" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        {getStatusBadge(auction.status)}
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 left-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleRemove(auction._id, e)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardContent className="p-3">
                                    <h3 className="font-medium text-sm truncate mb-2">{auction.title}</h3>
                                    <div className="flex items-center justify-between text-xs">
                                        <p className="font-bold text-primary">{formatCurrency(auction.currentPrice)}</p>
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(auction.endTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
