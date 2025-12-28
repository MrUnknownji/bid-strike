import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTimeRemaining } from '@/lib/utils/formatters';
import ImageCarousel from './ImageCarousel';
import { Clock, Gavel } from 'lucide-react';

interface AuctionCardProps {
    auction: {
        _id: string;
        title: string;
        images: string[];
        currentPrice: number;
        endTime: string;
        totalBids: number;
        status: string;
        seller: {
            username: string;
        };
    };
    className?: string;
}

export default function AuctionCard({ auction, className = '' }: AuctionCardProps) {
    const isEnding = new Date(auction.endTime).getTime() - Date.now() < 3600000;

    return (
        <Link href={`/auctions/${auction._id}`}>
            <Card className={`h-full overflow-hidden cursor-pointer group border-border/50 hover-lift ${className}`}>
                <div className="relative overflow-hidden">
                    <div className="transition-transform duration-500 group-hover:scale-105">
                        <ImageCarousel images={auction.images} />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="absolute top-3 right-3 z-20">
                        <Badge
                            className={`text-xs backdrop-blur-sm ${isEnding ? 'bg-destructive/90 text-white animate-pulse-soft' : 'bg-background/90'}`}
                            variant={isEnding ? 'destructive' : 'secondary'}
                        >
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeRemaining(auction.endTime)}
                        </Badge>
                    </div>

                    {auction.status === 'scheduled' && (
                        <Badge className="absolute top-3 left-3 z-20 bg-amber-600/90 text-amber-50 backdrop-blur-sm text-xs border-0">
                            Upcoming
                        </Badge>
                    )}

                    {auction.totalBids > 0 && (
                        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Gavel className="w-3.5 h-3.5" />
                            <span>{auction.totalBids} bids</span>
                        </div>
                    )}
                </div>

                <CardContent className="p-5">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300 leading-snug">
                        {auction.title}
                    </h3>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Current Bid</p>
                            <p className="text-xl font-bold text-primary tracking-tight">
                                {formatCurrency(auction.currentPrice)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">by</p>
                            <p className="text-sm font-medium text-foreground/80">{auction.seller.username}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
