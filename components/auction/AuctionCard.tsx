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
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                <div className="relative overflow-hidden">
                    <ImageCarousel images={auction.images} />
                    <Badge className="absolute top-2 right-2 z-20" variant="secondary">
                        {formatTimeRemaining(auction.endTime)}
                    </Badge>
                    {auction.status === 'scheduled' && (
                        <Badge className="absolute top-2 left-2 z-20 bg-background text-foreground hover:bg-background/90" variant="outline">
                            Upcoming
                        </Badge>
                    )}
                </div>

                <CardContent className="p-4">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {auction.title}
                    </h3>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Current Bid</p>
                            <p className="text-lg font-bold text-primary">
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

