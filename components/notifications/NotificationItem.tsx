'use client';

import Link from 'next/link';
import { Gavel, TrendingDown, Trophy, Clock, Bell } from 'lucide-react';

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

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onClose: () => void;
}

export default function NotificationItem({ notification, onRead, onClose }: NotificationItemProps) {
    const iconMap = {
        bid: Gavel,
        outbid: TrendingDown,
        auction_won: Trophy,
        auction_ended: Clock,
        system: Bell,
    };

    const Icon = iconMap[notification.type] || Bell;

    function getRelativeTime(date: string) {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return then.toLocaleDateString();
    }

    function handleClick() {
        if (!notification.isRead) {
            onRead();
        }
        onClose();
    }

    const content = (
        <div
            className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''
                }`}
            onClick={handleClick}
        >
            <div className={`shrink-0 p-2 rounded-full ${!notification.isRead ? 'bg-primary/10' : 'bg-muted'}`}>
                <Icon className={`h-4 w-4 ${!notification.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''} line-clamp-1`}>
                    {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {getRelativeTime(notification.createdAt)}
                </p>
            </div>
            {!notification.isRead && (
                <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
            )}
        </div>
    );

    if (notification.relatedAuction) {
        return (
            <Link href={`/auctions/${notification.relatedAuction._id}`}>
                {content}
            </Link>
        );
    }

    return content;
}
