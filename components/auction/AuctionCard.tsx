import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTimeRemaining } from '@/lib/utils/formatters';
import ImageCarousel from './ImageCarousel';

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
}

export default function AuctionCard({ auction }: AuctionCardProps) {
    return (
        <Link href={`/auctions/${auction._id}`}>
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group border-border/50">
                <div className="relative overflow-hidden">
                    <ImageCarousel images={auction.images} />
                    <Badge className="absolute top-3 right-3 z-20 text-xs" variant="secondary">
                        {formatTimeRemaining(auction.endTime)}
                    </Badge>
                    {auction.status === 'scheduled' && (
                        <Badge className="absolute top-3 left-3 z-20 bg-background/90 text-foreground hover:bg-background/90 text-xs" variant="outline">
                            Upcoming
                        </Badge>
                    )}
                </div>

                <CardContent className="p-5">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug">
                        {auction.title}
                    </h3>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Current Bid</p>
                            <p className="text-lg font-semibold text-primary tracking-tight">
                                {formatCurrency(auction.currentPrice)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">{auction.totalBids} bids</p>
                            <p className="text-xs text-muted-foreground">by {auction.seller.username}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}


