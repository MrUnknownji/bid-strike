'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface BidUpdate {
    amount: number;
    bidder: string;
    timestamp: string;
}

interface UseSocketOptions {
    auctionId: string;
    enabled?: boolean;
    onBidUpdate?: (bid: BidUpdate) => void;
}

export function useSocket({ auctionId, enabled = true, onBidUpdate }: UseSocketOptions) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        socketRef.current = io(socketUrl, {
            transports: ['websocket', 'polling'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            socket.emit('join-auction', auctionId);
        });

        socket.on('bid-update', (bid: BidUpdate) => {
            onBidUpdate?.(bid);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        return () => {
            socket.emit('leave-auction', auctionId);
            socket.disconnect();
        };
    }, [auctionId, enabled, onBidUpdate]);

    const emitBid = useCallback((bid: { amount: number; bidder: string }) => {
        if (socketRef.current && enabled) {
            socketRef.current.emit('new-bid', {
                auctionId,
                bid: { ...bid, timestamp: new Date().toISOString() },
            });
        }
    }, [auctionId, enabled]);

    return { emitBid };
}
