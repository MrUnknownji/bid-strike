'use client';

import StarRating from '@/components/common/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface Review {
    _id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    reviewer: {
        _id: string;
        username: string;
        avatar?: string;
    };
    auction?: {
        _id: string;
        title: string;
        images?: string[];
    };
}

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    function getRelativeTime(date: string) {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
        return then.toLocaleDateString();
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {review.reviewer.avatar ? (
                            <img
                                src={review.reviewer.avatar}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            review.reviewer.username.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm">{review.reviewer.username}</p>
                            <span className="text-xs text-muted-foreground">{getRelativeTime(review.createdAt)}</span>
                        </div>
                        <StarRating rating={review.rating} size="sm" className="mt-1" />
                        {review.comment && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{review.comment}</p>
                        )}
                        {review.auction && (
                            <Link
                                href={`/auctions/${review.auction._id}`}
                                className="text-xs text-primary hover:underline mt-2 inline-block"
                            >
                                for "{review.auction.title}"
                            </Link>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
