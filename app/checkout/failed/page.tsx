'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, HelpCircle } from 'lucide-react';

export default function CheckoutFailedPage() {
    return (
        <div className="max-w-lg mx-auto px-4 py-16">
            <Card className="text-center">
                <CardContent className="py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                        <XCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
                    <p className="text-muted-foreground mb-8">
                        We couldn't process your payment. Please try again or use a different payment method.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" className="gap-1" onClick={() => window.history.back()}>
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Link href="/contact">
                            <Button variant="secondary" className="w-full sm:w-auto gap-1">
                                <HelpCircle className="h-4 w-4" />
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
