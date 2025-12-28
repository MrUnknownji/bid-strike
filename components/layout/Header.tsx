'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/auctions', label: 'Auctions' },
        ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ];

    return (
        <header className="bg-card border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-bold text-primary transition-colors hover:text-primary/80">
                        BidStrike
                    </Link>

                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors ${pathname === link.href
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {!isLoading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href="/profile"
                                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
                                        >
                                            {user.username}
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={logout}>
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="ghost" size="sm">Login</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button size="sm">Sign Up</Button>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
