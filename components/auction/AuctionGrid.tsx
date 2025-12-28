import AuctionCard from './AuctionCard';
import { cn } from '@/lib/utils';

interface Auction {
    _id: string;
    title: string;
    images: string[];
    currentPrice: number;
    endTime: string;
    totalBids: number;
    status: string;
    seller: { username: string };
}

interface AuctionGridProps {
    auctions: Auction[];
    isLoading?: boolean;
}

export default function AuctionGrid({ auctions, isLoading }: AuctionGridProps) {
    if (auctions.length === 0 && !isLoading) {
        return (
            <div className="text-center py-16 animate-fade-up">
                <p className="text-muted-foreground text-lg">No auctions found</p>
                <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or check back later</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300',
                isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'
            )}
        >
            {auctions.map((auction, i) => (
                <div
                    key={auction._id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                >
                    <AuctionCard auction={auction} />
                </div>
            ))}
        </div>
    );
}
