'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquarePlus } from 'lucide-react';

export default function SuggestionDialog() {
    const [open, setOpen] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!suggestion.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'suggestion',
                    message: suggestion,
                    context: 'category-suggestion'
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                setSuggestion('');
                setTimeout(() => {
                    setOpen(false);
                    setSubmitted(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to submit suggestion:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" type="button" className="px-0 h-auto text-xs text-muted-foreground hover:text-primary mt-1">
                    Suggest Category/Subcategory
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Suggest a Category</DialogTitle>
                    <DialogDescription>
                        Can't find what you're looking for? Suggest a new category or subcategory we should add.
                    </DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <MessageSquarePlus className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Suggestion Sent!</h3>
                            <p className="text-sm text-muted-foreground">
                                Thanks for helping us improve our categories.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="suggestion">Your Suggestion</Label>
                            <Textarea
                                id="suggestion"
                                placeholder="e.g. Vintage -> Vinyl Records"
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                maxLength={200}
                                className="resize-none"
                                rows={3}
                                required
                            />
                            <p className="text-xs text-right text-muted-foreground">
                                {suggestion.length}/200
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading || !suggestion.trim()}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Submit Suggestion'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
