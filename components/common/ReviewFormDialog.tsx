'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/common/StarRating';

interface ReviewFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sellerId: string;
    sellerName: string;
    auctionId: string;
    auctionTitle: string;
    onSuccess?: () => void;
}

export default function ReviewFormDialog({
    open,
    onOpenChange,
    sellerId,
    sellerName,
    auctionId,
    auctionTitle,
    onSuccess,
}: ReviewFormDialogProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit() {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    revieweeId: sellerId,
                    auctionId,
                    rating,
                    comment: comment.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to submit review');
                return;
            }

            onOpenChange(false);
            setRating(0);
            setComment('');
            onSuccess?.();
        } catch {
            setError('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>
                        Rate your experience with {sellerName} for "{auctionTitle}"
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label>Your Rating</Label>
                        <StarRating
                            rating={rating}
                            size="lg"
                            interactive
                            onChange={setRating}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
