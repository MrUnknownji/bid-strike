'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/common/StarRating';
import UserReviews from '@/components/common/UserReviews';
import { User, Package, Trophy, Calendar } from 'lucide-react';

interface UserData {
    _id: string;
    username: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
    totalAuctionsListed: number;
    totalAuctionsWon: number;
    createdAt: string;
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    async function fetchUser() {
        try {
            const response = await fetch(`/api/users/${id}`);
            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-40" />
                <Skeleton className="h-60" />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                <p className="text-muted-foreground">This user profile doesn't exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="shrink-0 w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
                            {userData.avatar ? (
                                <img
                                    src={userData.avatar}
                                    alt=""
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                userData.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{userData.username}</h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <StarRating rating={userData.rating} size="md" />
                                <span className="text-muted-foreground">
                                    ({userData.totalReviews} reviews)
                                </span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-muted-foreground mt-2">
                                <Calendar className="h-4 w-4" />
                                Member since {formatDate(userData.createdAt)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Package className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{userData.totalAuctionsListed}</p>
                                <p className="text-sm text-muted-foreground">Auctions Listed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Trophy className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{userData.totalAuctionsWon}</p>
                                <p className="text-sm text-muted-foreground">Auctions Won</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <UserReviews userId={id} />
        </div>
    );
}
