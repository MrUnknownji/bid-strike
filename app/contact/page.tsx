'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mail, CheckCircle2, Loader2, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            type: 'contact',
            email: formData.get('email'),
            message: formData.get('message'),
            context: `Name: ${formData.get('name')}`
        };

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                setError('Failed to send message. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get in Touch</CardTitle>
                            <CardDescription>
                                Have questions about BidStrike? We're here to help.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="w-5 h-5 shrink-0" />
                                <span>sandeepkhati788@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin className="w-5 h-5 shrink-0" />
                                <span>123 Auction Lane, Bid City, BC 12345</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-5 h-5 shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Business Hours</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Monday - Friday</span>
                                <span className="font-medium">9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Saturday</span>
                                <span className="font-medium">10:00 AM - 4:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sunday</span>
                                <span className="font-medium text-muted-foreground">Closed</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send us a Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Message Sent!</h3>
                                    <p className="text-muted-foreground">
                                        Thanks for reaching out. We'll get back to you soon.
                                    </p>
                                </div>
                                <Button onClick={() => setSubmitted(false)} variant="outline">
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" required placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        required
                                        placeholder="How can we help you?"
                                        rows={5}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Message'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
