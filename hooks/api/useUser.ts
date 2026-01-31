import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export function useLikedAuctions() {
    return useQuery({
        queryKey: ['likedAuctions'],
        queryFn: () => fetchWithAuth('/api/user/like'),
        staleTime: 1000 * 60,
    });
}

export function useToggleLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (auctionId: string) =>
            fetchWithAuth('/api/user/like', {
                method: 'POST',
                body: JSON.stringify({ auctionId }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedAuctions'] });
            queryClient.invalidateQueries({ queryKey: ['userAuctionStatus'] });
        },
    });
}

export function useWatchlist() {
    return useQuery({
        queryKey: ['watchlist'],
        queryFn: () => fetchWithAuth('/api/user/watchlist'),
        staleTime: 1000 * 60,
    });
}

export function useToggleWatchlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (auctionId: string) =>
            fetchWithAuth('/api/user/watchlist', {
                method: 'POST',
                body: JSON.stringify({ auctionId }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            queryClient.invalidateQueries({ queryKey: ['userAuctionStatus'] });
        },
    });
}

export function useUserBids() {
    return useQuery({
        queryKey: ['userBids'],
        queryFn: () => fetchWithAuth('/api/user/bids'),
        staleTime: 1000 * 30,
    });
}

export function useUserWonAuctions() {
    return useQuery({
        queryKey: ['wonAuctions'],
        queryFn: () => fetchWithAuth('/api/auctions/won'),
        staleTime: 1000 * 60,
    });
}

export function useUserAuctionStatus(auctionId: string | undefined, isAuthenticated: boolean) {
    return useQuery({
        queryKey: ['userAuctionStatus', auctionId],
        queryFn: () => fetchWithAuth(`/api/user/status?auctionId=${auctionId}`),
        enabled: !!auctionId && isAuthenticated,
        retry: false,
    });
}
