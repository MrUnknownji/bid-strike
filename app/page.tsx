'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gavel, Trophy, Search, Sparkles } from 'lucide-react';

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
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-down">
            <Sparkles className="w-4 h-4" />
            <span>Live auctions happening now</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-[1.1] animate-fade-up">
            Win Amazing Items at{' '}
            <br className="hidden sm:block" />
            <span className="text-primary relative">
              Great Prices
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed animate-fade-up stagger-2">
            Join thousands of bidders on the most trusted online auction platform.
            Find unique items and score incredible deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
            <Link href="/auctions">
              <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                Browse Auctions
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {mounted && (
              <Link href={isLoggedIn ? '/auctions/create' : '/register'}>
                <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base hover:bg-primary/5 transition-all duration-300">
                  <Gavel className="w-4 h-4" />
                  {isLoggedIn ? 'Create Auction' : 'Start Selling'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,var(--muted)_50%,transparent_100%)] opacity-50" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Simple steps to start winning auctions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Find Items',
                desc: 'Browse thousands of items across various categories',
                icon: Search,
              },
              {
                step: '02',
                title: 'Place Bids',
                desc: 'Bid on items you love and track your auctions in real-time',
                icon: Gavel,
              },
              {
                step: '03',
                title: 'Win & Enjoy',
                desc: 'Win auctions and receive your items quickly and securely',
                icon: Trophy,
              },
            ].map((item, index) => (
              <Card
                key={item.step}
                className={`relative overflow-hidden hover-lift group border-border/50 stagger-${index + 1}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 select-none group-hover:text-primary/20 transition-colors duration-300">
                  {item.step}
                </div>
                <CardContent className="pt-10 pb-10 relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {mounted && !isLoggedIn && (
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-border/50 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-12 md:p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <Gavel className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ready to Start Bidding?</h2>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
                  Create your free account today and join our community of auction enthusiasts.
                </p>
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20">
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
