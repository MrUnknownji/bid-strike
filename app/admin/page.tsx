'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Users, Gavel, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalAuctions: number;
    activeAuctions: number;
    completedAuctions: number;
}

interface RecentUser {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
}

interface RecentAuction {
    _id: string;
    title: string;
    currentPrice: number;
    status: string;
    createdAt: string;
    seller: { username: string };
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }

        if (user?.role === 'admin') {
            fetchAdminData();
        }
    }, [user, authLoading, router]);

    async function fetchAdminData() {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/admin', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
                setRecentUsers(data.recentUsers);
                setRecentAuctions(data.recentAuctions);
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function getStatusBadge(status: string) {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            scheduled: 'secondary',
            ended: 'outline',
            sold: 'default',
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    if (authLoading || isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
        { label: 'Total Auctions', value: stats?.totalAuctions || 0, icon: Gavel, color: 'text-purple-500' },
        { label: 'Active Auctions', value: stats?.activeAuctions || 0, icon: TrendingUp, color: 'text-green-500' },
        { label: 'Completed', value: stats?.completedAuctions || 0, icon: CheckCircle, color: 'text-amber-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Link href="/admin/users">
                        <Button variant="outline" size="sm">
                            Manage Users
                        </Button>
                    </Link>
                    <Link href="/admin/auctions">
                        <Button variant="outline" size="sm">
                            Manage Auctions
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                                </div>
                                <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Users</CardTitle>
                        <Link href="/admin/users">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No users yet</p>
                            ) : (
                                recentUsers.map((u) => (
                                    <div key={u._id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                        <div>
                                            <p className="font-medium">{u.username}</p>
                                            <p className="text-sm text-muted-foreground">{u.email}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Auctions</CardTitle>
                        <Link href="/admin/auctions">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAuctions.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No auctions yet</p>
                            ) : (
                                recentAuctions.map((auction) => (
                                    <div key={auction._id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="font-medium truncate">{auction.title}</p>
                                            <p className="text-sm text-muted-foreground">by {auction.seller.username}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(auction.status)}
                                            <p className="text-sm font-medium">${auction.currentPrice}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
