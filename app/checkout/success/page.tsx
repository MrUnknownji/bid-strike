'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="max-w-lg mx-auto px-4 py-16">
            <Card className="text-center">
                <CardContent className="py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-4 mb-8">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-5 w-5" />
                            <span>The seller will be notified and will ship your item soon.</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full sm:w-auto">
                                View My Orders
                            </Button>
                        </Link>
                        <Link href="/auctions">
                            <Button className="w-full sm:w-auto gap-1">
                                Continue Shopping <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
