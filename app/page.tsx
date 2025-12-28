'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gavel, Trophy, Search } from 'lucide-react';

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
      <section className="relative py-28 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-6">
            Live auctions happening now
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-tight">
            Win Amazing Items at{' '}
            <br className="hidden sm:block" />
            <span className="text-primary">Great Prices</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of bidders on the most trusted online auction platform.
            Find unique items and score incredible deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auctions">
              <Button size="lg" className="gap-2 px-6">
                Browse Auctions
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {mounted && (
              <Link href={isLoggedIn ? '/auctions/create' : '/register'}>
                <Button size="lg" variant="outline" className="gap-2 px-6">
                  <Gavel className="w-4 h-4" />
                  {isLoggedIn ? 'Create Auction' : 'Start Selling'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to start winning auctions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                title: 'Find Items',
                desc: 'Browse thousands of items across various categories',
                icon: Search
              },
              {
                step: '02',
                title: 'Place Bids',
                desc: 'Bid on items you love and track your auctions in real-time',
                icon: Gavel
              },
              {
                step: '03',
                title: 'Win & Enjoy',
                desc: 'Win auctions and receive your items quickly and securely',
                icon: Trophy
              },
            ].map((item) => (
              <Card
                key={item.step}
                className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group border-border/50"
              >
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary/15 select-none">
                  {item.step}
                </div>
                <CardContent className="pt-8 pb-8 relative">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-primary/15">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {mounted && !isLoggedIn && (
        <section className="py-20 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-border/50">
              <div className="bg-muted/30 p-10 md:p-14 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Ready to Start Bidding?</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Create your free account today and join our community of auction enthusiasts.
                </p>
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-6">
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


