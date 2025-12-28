'use client';

import Link from 'next/link';
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
        <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link
                        href="/"
                        className="text-xl font-bold text-foreground tracking-tight transition-colors hover:text-primary"
                    >
                        BidStrike
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-sm font-medium transition-colors duration-200 py-1 ${pathname === link.href
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute left-0 -bottom-0.5 h-px bg-primary transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}
                                />
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <ThemeToggle />
                        {!isLoading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/profile"
                                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline px-2"
                                        >
                                            {user.username}
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={logout}>
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Link href="/login">
                                            <Button variant="ghost" size="sm">Login</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button size="sm">Sign Up</Button>
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
