'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AuctionFilters, { FilterOption } from '@/components/common/AuctionFilters';
import { formatCurrency } from '@/lib/utils/formatters';
import { Trash2, Pencil, Clock, ArrowLeft, Package, AlertTriangle, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Auction {
    _id: string;
    title: string;
    images: string[];
    currentPrice: number;
    endTime: string;
    startTime: string;
    totalBids: number;
    status: string;
}

const FILTER_OPTIONS: FilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Ongoing' },
    { value: 'scheduled', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' },
];

const EDIT_BUFFER_MINUTES = 30;

export default function MyAuctionsPage() {
    const router = useRouter();
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAuctions = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);

            const res = await fetch(`/api/auctions/my?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok && res.status === 401) {
                router.push('/login');
                return;
            }

            const data = await res.json();
            setAuctions(data.auctions || []);
        } catch (error) {
            console.error('Failed to fetch auctions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [filter, router]);

    useEffect(() => {
        fetchAuctions();
    }, [fetchAuctions]);

    const handleDelete = async () => {
        if (!deleteId) return;

        const token = localStorage.getItem('accessToken');
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/auctions/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setAuctions((prev) => prev.filter((a) => a._id !== deleteId));
            }
        } catch (error) {
            console.error('Failed to delete auction:', error);
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const canEdit = (auction: Auction) => {
        if (auction.status === 'ended') return false;
        if (auction.status === 'active') return false;

        const now = new Date();
        const startTime = new Date(auction.startTime);
        const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);

        return minutesUntilStart >= EDIT_BUFFER_MINUTES;
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
            active: { variant: 'default', label: 'Ongoing' },
            scheduled: { variant: 'secondary', label: 'Upcoming' },
            ended: { variant: 'outline', label: 'Ended' },
        };
        const { variant, label } = config[status] || { variant: 'outline', label: status };
        return <Badge variant={variant}>{label}</Badge>;
    };

    const handleCardClick = (id: string) => {
        router.push(`/auctions/${id}`);
    };

    const auctionToDelete = auctions.find((a) => a._id === deleteId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">My Auctions</h1>
                    <p className="text-muted-foreground text-sm">Manage your listings</p>
                </div>
            </div>

            <AuctionFilters
                options={FILTER_OPTIONS}
                selected={filter}
                onSelect={setFilter}
                className="mb-6"
            />

            <div
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
                )}
            >
                {auctions.length === 0 && !isLoading ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No auctions found</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                {filter === 'all' ? "You haven't created any auctions yet" : `No ${filter} auctions`}
                            </p>
                            <Link href="/auctions/create">
                                <Button>Create Auction</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {auctions.map((auction) => (
                            <Card
                                key={auction._id}
                                className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all h-full"
                                onClick={() => handleCardClick(auction._id)}
                            >
                                <div className="h-40 bg-muted relative overflow-hidden">
                                    {auction.images?.[0] ? (
                                        <img
                                            src={auction.images[0]}
                                            alt={auction.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <ImageOff className="w-6 h-6 mb-1" />
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        {getStatusBadge(auction.status)}
                                    </div>
                                </div>

                                <CardContent className="p-3">
                                    <h3 className="font-medium text-sm truncate mb-2">{auction.title}</h3>

                                    <div className="flex items-center justify-between text-xs mb-3">
                                        <div>
                                            <p className="text-muted-foreground">Current</p>
                                            <p className="font-bold text-primary">{formatCurrency(auction.currentPrice)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-muted-foreground flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {auction.status === 'scheduled' ? 'Starts' : 'Ends'}
                                            </p>
                                            <p>{new Date(auction.status === 'scheduled' ? auction.startTime : auction.endTime).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-1 text-xs h-8"
                                            disabled={!canEdit(auction)}
                                            onClick={() => router.push(`/auctions/${auction._id}/edit`)}
                                        >
                                            <Pencil className="w-3 h-3" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeleteId(auction._id)}
                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 p-0"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Delete Auction
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{auctionToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
