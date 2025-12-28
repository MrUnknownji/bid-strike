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
} from 'lucide-react';

interface User {
    id: string;
    username: string;
    email: string;
    rating: number;
    totalAuctionsWon: number;
    totalAuctionsListed: number;
}

interface RecentAuction {
    _id: string;
    title: string;
    currentPrice: number;
    status: string;
    endTime: string;
}

interface Stats {
    liked: number;
    watchlist: number;
    auctionsWon: number;
    listedAuctions: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
    const [stats, setStats] = useState<Stats>({ liked: 0, watchlist: 0, auctionsWon: 0, listedAuctions: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [userRes, auctionsRes, likedRes, watchlistRes] = await Promise.all([
                    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/auctions/my?limit=3', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/user/like', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/user/watchlist', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (!userRes.ok) {
                    localStorage.removeItem('accessToken');
                    router.push('/login');
                    return;
                }

                const userData = await userRes.json();
                setUser(userData.user);

                let listedCount = 0;
                if (auctionsRes.ok) {
                    const auctionsData = await auctionsRes.json();
                    setRecentAuctions(auctionsData.auctions || []);
                    listedCount = auctionsData.auctions?.length || 0;
                }

                const likedData = likedRes.ok ? await likedRes.json() : { auctions: [] };
                const watchlistData = watchlistRes.ok ? await watchlistRes.json() : { auctions: [] };

                setStats({
                    liked: likedData.auctions?.length || 0,
                    watchlist: watchlistData.auctions?.length || 0,
                    auctionsWon: userData.user.totalAuctionsWon || 0,
                    listedAuctions: listedCount,
                });
            } catch {
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user.username}</h1>
                    <p className="text-muted-foreground">Here's what's happening with your auctions</p>
                </div>
                <Link href="/auctions/create">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Auction
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-primary" />
                            My Auctions
                        </CardTitle>
                        <Link href="/dashboard/my-auctions">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentAuctions.length > 0 ? (
                            <div className="space-y-3">
                                {recentAuctions.map((auction) => (
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

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
