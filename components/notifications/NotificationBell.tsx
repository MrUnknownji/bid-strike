'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationList from './NotificationList';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBell() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        async function fetchUnreadCount() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                const response = await fetch('/api/notifications?limit=1', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.unreadCount);
                }
            } catch (error) {
                console.error('Failed to fetch notification count:', error);
            }
        }

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    if (!user) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <NotificationList onClose={() => setOpen(false)} onMarkAllRead={() => setUnreadCount(0)} />
            </PopoverContent>
        </Popover>
    );
}
