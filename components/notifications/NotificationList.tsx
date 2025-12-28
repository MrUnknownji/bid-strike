'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationItem from './NotificationItem';
import { Check, Inbox } from 'lucide-react';

interface Notification {
    _id: string;
    type: 'bid' | 'outbid' | 'auction_won' | 'auction_ended' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedAuction?: {
        _id: string;
        title: string;
        images?: string[];
    };
}

interface NotificationListProps {
    onClose: () => void;
    onMarkAllRead: () => void;
}

export default function NotificationList({ onClose, onMarkAllRead }: NotificationListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('/api/notifications?limit=20', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleMarkAllRead() {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                onMarkAllRead();
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }

    async function handleMarkRead(id: string) {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`/api/notifications/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }

    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
                {hasUnread && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={handleMarkAllRead}
                    >
                        <Check className="h-3 w-3" />
                        Mark all read
                    </Button>
                )}
            </div>
            <ScrollArea className="h-80">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Inbox className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onRead={() => handleMarkRead(notification._id)}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
