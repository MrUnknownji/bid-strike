'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Gavel,
    Eye,
    Trophy,
    Package,
    Plus,
    ArrowRight,
    Clock,
    Heart,
    RefreshCw,
} from 'lucide-react';
import { useMyAuctions } from '@/hooks/api/useAuctions';
import { useLikedAuctions, useWatchlist } from '@/hooks/api/useUser';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const { data: myAuctionsData, isLoading: auctionsLoading, error: auctionsError, refetch: refetchAuctions } = useMyAuctions({ limit: 3 });
    const { data: likedData, isLoading: likedLoading } = useLikedAuctions();
    const { data: watchlistData, isLoading: watchlistLoading } = useWatchlist();

    const isLoading = authLoading || auctionsLoading || likedLoading || watchlistLoading;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!authLoading && !token) {
            router.push('/login');
        }
    }, [authLoading, router]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            scheduled: 'secondary',
            ended: 'outline',
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (!user) return null;

    const recentAuctions = myAuctionsData?.auctions || [];
    const stats = {
        liked: likedData?.auctions?.length || 0,
        watchlist: watchlistData?.auctions?.length || 0,
        auctionsWon: (user as any)?.totalAuctionsWon || 0,
        listedAuctions: recentAuctions.length,
    };

    const statCards = [
        {
            label: 'Liked',
            value: stats.liked,
            icon: Heart,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            href: '/dashboard/liked',
        },
        {
            label: 'Watchlist',
            value: stats.watchlist,
            icon: Eye,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            href: '/dashboard/watchlist',
        },
        {
            label: 'Won',
            value: stats.auctionsWon,
            icon: Trophy,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            href: '#',
        },
        {
            label: 'Listed',
            value: stats.listedAuctions,
            icon: Package,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            href: '/dashboard/my-auctions',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.username}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your auctions</p>
                </div>
                <Link href="/auctions/create">
                    <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Auction
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {statCards.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-border/50">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-xl font-semibold mt-0.5">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-primary" />
                            My Auctions
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {auctionsError && (
                                <Button variant="ghost" size="sm" onClick={() => refetchAuctions()}>
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                            )}
                            <Link href="/dashboard/my-auctions">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {auctionsError ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-3">Failed to load auctions</p>
                                <Button variant="outline" size="sm" onClick={() => refetchAuctions()} className="gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </Button>
                            </div>
                        ) : recentAuctions.length > 0 ? (
                            <div className="space-y-3">
                                {recentAuctions.map((auction: any) => (
                                    <Link
                                        key={auction._id}
                                        href={`/auctions/${auction._id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{auction.title}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(auction.endTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {getStatusBadge(auction.status)}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">No auctions yet</p>
                                <Link href="/auctions/create">
                                    <Button variant="outline" size="sm" className="mt-3">
                                        Create your first auction
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-4">
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        <Link href="/auctions/create" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Auction
                            </Button>
                        </Link>
                        <Link href="/dashboard/my-auctions" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Package className="w-4 h-4" />
                                Manage My Auctions
                            </Button>
                        </Link>
                        <Link href="/dashboard/liked" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Heart className="w-4 h-4" />
                                Liked Auctions
                            </Button>
                        </Link>
                        <Link href="/dashboard/watchlist" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Eye className="w-4 h-4" />
                                Watchlist
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
