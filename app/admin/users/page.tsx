'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Search, Ban, ShieldCheck, ShieldOff, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface User {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    isActive: boolean;
    isBanned: boolean;
    rating: number;
    totalAuctionsListed: number;
    totalAuctionsWon: number;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (search) params.set('search', search);

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }

        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user, authLoading, router, fetchUsers]);

    async function handleAction(userId: string, action: string) {
        setActionLoading(userId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId, action }),
            });

            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setActionLoading(null);
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    if (authLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">User Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Users {pagination && `(${pagination.total})`}</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No users found</p>
                    ) : (
                        <div className="space-y-2">
                            {users.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{u.username}</p>
                                            {u.role === 'admin' && (
                                                <Badge variant="default">Admin</Badge>
                                            )}
                                            {u.isBanned && (
                                                <Badge variant="destructive">Banned</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{u.email}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                            <span>Joined {formatDate(u.createdAt)}</span>
                                            <span>Rating: {u.rating.toFixed(1)}</span>
                                            <span>Listed: {u.totalAuctionsListed}</span>
                                            <span>Won: {u.totalAuctionsWon}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {u.isBanned ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(u._id, 'unban')}
                                                disabled={actionLoading === u._id}
                                            >
                                                <UserCheck className="h-4 w-4 mr-1" />
                                                Unban
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(u._id, 'ban')}
                                                disabled={actionLoading === u._id}
                                            >
                                                <Ban className="h-4 w-4 mr-1" />
                                                Ban
                                            </Button>
                                        )}
                                        {u.role === 'admin' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(u._id, 'removeAdmin')}
                                                disabled={actionLoading === u._id || u._id === user.id}
                                            >
                                                <ShieldOff className="h-4 w-4 mr-1" />
                                                Remove Admin
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(u._id, 'makeAdmin')}
                                                disabled={actionLoading === u._id}
                                            >
                                                <ShieldCheck className="h-4 w-4 mr-1" />
                                                Make Admin
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
