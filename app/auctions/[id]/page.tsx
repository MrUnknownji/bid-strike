'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import CountdownTimer from '@/components/auction/CountdownTimer';
import BidSection from '@/components/auction/BidSection';
import BidHistory from '@/components/auction/BidHistory';
import { formatCurrency } from '@/lib/utils/formatters';
import { Trash2, AlertTriangle, Pencil, Heart, Eye } from 'lucide-react';

interface Auction {
    _id: string;
    title: string;
    description: string;
    images: string[];
    currentPrice: number;
    startingPrice: number;
    bidIncrement: number;
    startTime: string;
    endTime: string;
    status: string;
    condition: string;
    totalBids: number;
    viewCount: number;
    seller: {
        _id: string;
        username: string;
        avatar?: string;
        rating: number;
    };
    category?: {
        name: string;
    };
    createdAt: string;
}

function PageLoader() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="aspect-square" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-16 w-1/2" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        </div>
    );
}

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isWatching, setIsWatching] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bidRefreshTrigger, setBidRefreshTrigger] = useState(0);

    const fetchAuction = async () => {
        try {
            const res = await fetch(`/api/auctions/${id}`);
            if (res.ok) {
                const data = await res.json();
                setAuction(data.auction);
            }
        } catch (error) {
            console.error('Failed to fetch auction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuction();

        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUserId(user.id);
            } catch {
                setCurrentUserId(null);
            }
        }

        if (token) {
            fetch(`/api/user/status?auctionId=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    setIsLiked(data.liked);
                    setIsWatching(data.watching);
                })
                .catch(() => { });
        }
    }, [id]);

    const handleDelete = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/auctions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                router.push('/dashboard/my-auctions');
            }
        } catch (error) {
            console.error('Failed to delete auction:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (isLoading) return <PageLoader />;

    if (!auction) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Auction not found</h1>
            </div>
        );
    }

    const isEnded = new Date(auction.endTime) < new Date() || auction.status === 'ended';
    const isOwner = currentUserId && auction.seller._id === currentUserId;

    const canEdit = () => {
        if (!isOwner) return false;
        if (auction.status === 'ended') return false;
        if (auction.status === 'active') return false;
        const now = new Date();
        const startTime = new Date(auction.startTime);
        const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);
        return minutesUntilStart >= 30;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                        {auction.images[selectedImage] ? (
                            <img
                                src={auction.images[selectedImage]}
                                alt={auction.title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No Image
                            </div>
                        )}
                    </div>

                    {auction.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {auction.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-20 h-20 flex-shrink-0 rounded border-2 overflow-hidden ${i === selectedImage ? 'border-primary' : 'border-border'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h1 className="text-2xl font-bold">{auction.title}</h1>
                        {isOwner && (
                            <div className="flex gap-2 shrink-0">
                                {canEdit() && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/auctions/${id}/edit`)}
                                    >
                                        <Pencil className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Bid</p>
                            <p className="text-3xl font-bold text-primary">
                                {formatCurrency(auction.currentPrice)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Time Left</p>
                            <CountdownTimer endTime={auction.endTime} />
                        </div>
                    </div>

                    {isLoggedIn && !isOwner && (
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={isLiked ? 'default' : 'outline'}
                                size="sm"
                                onClick={async () => {
                                    const token = localStorage.getItem('accessToken');
                                    if (!token) return;
                                    const res = await fetch('/api/user/like', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({ auctionId: id }),
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        setIsLiked(data.liked);
                                    }
                                }}
                                className="gap-1"
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                {isLiked ? 'Liked' : 'Like'}
                            </Button>
                            <Button
                                variant={isWatching ? 'default' : 'outline'}
                                size="sm"
                                onClick={async () => {
                                    const token = localStorage.getItem('accessToken');
                                    if (!token) return;
                                    const res = await fetch('/api/user/watchlist', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({ auctionId: id }),
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        setIsWatching(data.watching);
                                    }
                                }}
                                className="gap-1"
                            >
                                <Eye className={`w-4 h-4 ${isWatching ? 'fill-current' : ''}`} />
                                {isWatching ? 'Watching' : 'Watch'}
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                            <span className="text-muted-foreground">Starting Price:</span>{' '}
                            {formatCurrency(auction.startingPrice)}
                        </div>
                        <div>
                            <span className="text-muted-foreground">Bids:</span> {auction.totalBids}
                        </div>
                        <div>
                            <span className="text-muted-foreground">Condition:</span>{' '}
                            <Badge variant="secondary" className="capitalize">
                                {auction.condition.replace(/-/g, ' ')}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Views:</span> {auction.viewCount}
                        </div>
                    </div>

                    <BidSection
                        auctionId={auction._id}
                        currentPrice={auction.currentPrice}
                        bidIncrement={auction.bidIncrement}
                        isEnded={isEnded}
                        startTime={auction.startTime}
                        onBidPlaced={() => {
                            fetchAuction();
                            setBidRefreshTrigger(prev => prev + 1);
                        }}
                    />

                    <Separator className="my-8" />

                    <div>
                        <h2 className="font-semibold mb-2">Description</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {auction.description}
                        </p>
                    </div>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-base">Seller</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-medium">
                                    {auction.seller.avatar &&
                                        !auction.seller.avatar.startsWith('default-') ? (
                                        <img
                                            src={auction.seller.avatar}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{auction.seller.username[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{auction.seller.username}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Rating: {auction.seller.rating}/5
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="my-12" />

            <div>
                <h2 className="text-xl font-bold mb-4">Bid History</h2>
                <BidHistory auctionId={auction._id} refreshTrigger={bidRefreshTrigger} />
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Delete Auction
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{auction.title}"? This action cannot be
                            undone and all bids will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Auction'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
