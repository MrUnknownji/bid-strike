'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gavel, Trophy, Zap } from 'lucide-react';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div>
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Zap className="w-4 h-4" />
            Live auctions happening now
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            Win Amazing Items at{' '}
            <span className="text-primary">Great Prices</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            Join thousands of bidders on the most trusted online auction platform.
            Find unique items and score incredible deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Link href="/auctions">
              <Button size="lg" className="gap-2">
                Browse Auctions
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {mounted && (
              <Link href={isLoggedIn ? '/auctions/create' : '/register'}>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  {isLoggedIn ? 'Create Auction' : 'Start Selling'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to start winning auctions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Find Items',
                desc: 'Browse thousands of items across various categories',
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              },
              {
                step: '02',
                title: 'Place Bids',
                desc: 'Bid on items you love and track your auctions in real-time',
                icon: <Gavel className="w-6 h-6" />
              },
              {
                step: '03',
                title: 'Win & Enjoy',
                desc: 'Win auctions and receive your items quickly and securely',
                icon: <Trophy className="w-6 h-6" />
              },
            ].map((item, i) => (
              <Card
                key={item.step}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5 -mr-4 -mt-4 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <CardContent className="pt-8 pb-6 relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {mounted && !isLoggedIn && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Bidding?</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Create your free account today and join our community of auction enthusiasts.
                </p>
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
