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

export function useAuction(id: string | undefined) {
    return useQuery({
        queryKey: ['auction', id],
        queryFn: () => fetchWithAuth(`/api/auctions/${id}`),
        enabled: !!id,
        staleTime: 1000 * 30,
    });
}

interface UseAuctionsParams {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    status?: string;
    search?: string;
    sort?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    condition?: string;
}

export function useAuctions(params: UseAuctionsParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    return useQuery({
        queryKey: ['auctions', params],
        queryFn: () => fetchWithAuth(`/api/auctions?${searchParams.toString()}`),
        staleTime: 1000 * 30,
    });
}

export function useMyAuctions(params: { limit?: number; status?: string } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.append(key, String(value));
        }
    });

    return useQuery({
        queryKey: ['myAuctions', params],
        queryFn: () => fetchWithAuth(`/api/auctions/my?${searchParams.toString()}`),
        staleTime: 1000 * 30,
    });
}

export function usePlaceBid() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ auctionId, amount }: { auctionId: string; amount: number }) =>
            fetchWithAuth(`/api/auctions/${auctionId}/bid`, {
                method: 'POST',
                body: JSON.stringify({ amount }),
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['auction', variables.auctionId] });
            queryClient.invalidateQueries({ queryKey: ['auctions'] });
        },
    });
}

export function useDeleteAuction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (auctionId: string) =>
            fetchWithAuth(`/api/auctions/${auctionId}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auctions'] });
            queryClient.invalidateQueries({ queryKey: ['myAuctions'] });
        },
    });
}
