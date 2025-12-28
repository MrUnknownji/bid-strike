import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-foreground text-lg font-bold mb-4">BidStrike</h3>
                        <p className="text-sm text-muted-foreground">Your trusted online auction platform.</p>
                    </div>

                    <div>
                        <h4 className="text-foreground font-medium mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/auctions" className="hover:text-foreground transition-colors">
                                    Browse Auctions
                                </Link>
                            </li>
                            <li>
                                <Link href="/auctions/create" className="hover:text-foreground transition-colors">
                                    Sell an Item
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground font-medium mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/contact" className="hover:text-foreground transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-foreground transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground font-medium mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/terms" className="hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <p className="text-sm text-center text-muted-foreground">
                    © {currentYear} BidStrike. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
