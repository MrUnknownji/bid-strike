'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StarRating from '@/components/common/StarRating';
import ReviewCard from '@/components/common/ReviewCard';

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

interface UserReviewsProps {
    userId: string;
}

export default function UserReviews({ userId }: UserReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [userId]);

    async function fetchReviews(pageNum = 1, append = false) {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/reviews?userId=${userId}&page=${pageNum}&limit=5`);
            if (response.ok) {
                const data = await response.json();
                setReviews(append ? [...reviews, ...data.reviews] : data.reviews);
                setAverageRating(data.averageRating);
                setTotalReviews(data.totalReviews);
                setHasMore(data.pagination.page < data.pagination.pages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleLoadMore() {
        fetchReviews(page + 1, true);
    }

    if (isLoading && reviews.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Reviews</CardTitle>
                    {totalReviews > 0 && (
                        <div className="flex items-center gap-2">
                            <StarRating rating={averageRating} size="sm" />
                            <span className="text-sm text-muted-foreground">
                                {averageRating.toFixed(1)} ({totalReviews} reviews)
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                        {hasMore && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleLoadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Load More'}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
