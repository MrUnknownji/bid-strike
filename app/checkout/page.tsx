'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Clock, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface Auction {
    _id: string;
    title: string;
    images: string[];
    currentPrice: number;
    seller: { username: string };
    shippingInfo?: {
        available: boolean;
        cost?: number;
        estimatedDays?: number;
    };
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auctionId = searchParams.get('auction');
    const { user, isLoading: authLoading } = useAuth();
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (auctionId) {
            fetchAuction();
        } else {
            setIsLoading(false);
        }
    }, [user, authLoading, auctionId, router]);

    async function fetchAuction() {
        try {
            const response = await fetch(`/api/auctions/${auctionId}`);
            if (response.ok) {
                const data = await response.json();
                setAuction(data);
            }
        } catch (error) {
            console.error('Failed to fetch auction:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function handlePayNow() {
        setShowComingSoon(true);
    }

    const shippingCost = auction?.shippingInfo?.available ? (auction.shippingInfo.cost || 0) : 0;
    const total = (auction?.currentPrice || 0) + shippingCost;

    if (authLoading || isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    if (!auctionId || !auction) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">No Auction Selected</h1>
                <p className="text-muted-foreground mb-6">Please select a won auction to proceed with checkout.</p>
                <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                            <CardDescription>Enter your delivery address</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    value={shippingAddress.street}
                                    onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={shippingAddress.city}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={shippingAddress.state}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                                        placeholder="NY"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="zipCode">ZIP Code</Label>
                                    <Input
                                        id="zipCode"
                                        value={shippingAddress.zipCode}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                        placeholder="10001"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={shippingAddress.country}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                                        placeholder="United States"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                {auction.images?.[0] && (
                                    <img
                                        src={auction.images[0]}
                                        alt=""
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium line-clamp-2">{auction.title}</p>
                                    <p className="text-sm text-muted-foreground">Seller: {auction.seller.username}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Item Price</span>
                                    <span>${auction.currentPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        Shipping
                                    </span>
                                    <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free'}</span>
                                </div>
                                {auction.shippingInfo?.estimatedDays && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Estimated Delivery
                                        </span>
                                        <span>{auction.shippingInfo.estimatedDays} days</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <Button className="w-full gap-2" size="lg" onClick={handlePayNow}>
                                <CreditCard className="h-5 w-5" />
                                Pay Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Coming Soon</DialogTitle>
                        <DialogDescription>
                            Online payment integration is currently in development. For now, please contact the seller directly to arrange payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowComingSoon(false)}>Close</Button>
                        <Link href="/dashboard">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CheckoutLoading() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-96" />
                <Skeleton className="h-80" />
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutContent />
        </Suspense>
    );
}
