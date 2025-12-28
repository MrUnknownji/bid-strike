import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card border-t border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-1">
                        <h3 className="text-foreground text-lg font-bold tracking-tight mb-3">BidStrike</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your trusted online auction platform for unique finds and great deals.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-4">Explore</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/auctions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Browse Auctions
                                </Link>
                            </li>
                            <li>
                                <Link href="/auctions/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Sell an Item
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-10 bg-border/50" />

                <p className="text-xs text-center text-muted-foreground tracking-wide">
                    © {currentYear} BidStrike. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
