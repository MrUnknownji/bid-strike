'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Header() {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/auctions', label: 'Auctions' },
        ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
        ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
    ];

    return (
        <header className="bg-card/80 backdrop-blur-lg border-b border-border/40 sticky top-0 z-40 animate-fade-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 text-xl font-bold text-foreground tracking-tight transition-all duration-300 hover:opacity-80 group"
                    >
                        <Image
                            src="/icon.svg"
                            alt="BidStrike"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span>BidStrike</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <ThemeToggle />
                        {!isLoading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-2 ml-2">
                                        <Link
                                            href="/profile"
                                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                                {user.username}
                                            </span>
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 ml-2">
                                        <Link href="/login">
                                            <Button variant="ghost" size="sm">Login</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button size="sm" className="shadow-sm shadow-primary/20">Sign Up</Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
