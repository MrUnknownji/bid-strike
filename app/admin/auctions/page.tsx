'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Search, Star, StarOff, Trash2, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Auction {
    _id: string;
    title: string;
    currentPrice: number;
    status: string;
    isFeatured: boolean;
    startTime: string;
    endTime: string;
    createdAt: string;
    images: string[];
    seller: { username: string };
    category?: { name: string };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminAuctionsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchAuctions = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (search) params.set('search', search);
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

            const response = await fetch(`/api/admin/auctions?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAuctions(data.auctions);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch auctions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }

        if (user?.role === 'admin') {
            fetchAuctions();
        }
    }, [user, authLoading, router, fetchAuctions]);

    async function handleAction(auctionId: string, action: string) {
        setActionLoading(auctionId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/admin/auctions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ auctionId, action }),
            });

            if (response.ok) {
                fetchAuctions();
            }
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDelete(auctionId: string) {
        if (!confirm('Are you sure you want to delete this auction?')) return;

        setActionLoading(auctionId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/admin/auctions?id=${auctionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchAuctions();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setActionLoading(null);
        }
    }

    function getStatusBadge(status: string) {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            scheduled: 'secondary',
            ended: 'outline',
            sold: 'default',
            cancelled: 'destructive',
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

    if (authLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Auction Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle>All Auctions {pagination && `(${pagination.total})`}</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="ended">Ended</SelectItem>
                                    <SelectItem value="sold">Sold</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search auctions..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20" />
                            ))}
                        </div>
                    ) : auctions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No auctions found</p>
                    ) : (
                        <div className="space-y-2">
                            {auctions.map((auction) => (
                                <div
                                    key={auction._id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {auction.images?.[0] && (
                                            <img
                                                src={auction.images[0]}
                                                alt=""
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{auction.title}</p>
                                                {auction.isFeatured && (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>by {auction.seller.username}</span>
                                                {auction.category && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{auction.category.name}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <span>Created {formatDate(auction.createdAt)}</span>
                                                <span>Ends {formatDate(auction.endTime)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right mr-4">
                                            {getStatusBadge(auction.status)}
                                            <p className="text-sm font-medium mt-1">${auction.currentPrice}</p>
                                        </div>
                                        <Link href={`/auctions/${auction._id}`}>
                                            <Button variant="ghost" size="icon" title="View">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {auction.isFeatured ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleAction(auction._id, 'unfeature')}
                                                disabled={actionLoading === auction._id}
                                                title="Remove from featured"
                                            >
                                                <StarOff className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleAction(auction._id, 'feature')}
                                                disabled={actionLoading === auction._id}
                                                title="Feature this auction"
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {auction.status === 'active' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleAction(auction._id, 'cancel')}
                                                disabled={actionLoading === auction._id}
                                                title="Cancel auction"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(auction._id)}
                                            disabled={actionLoading === auction._id}
                                            className="text-destructive hover:text-destructive"
                                            title="Delete auction"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
