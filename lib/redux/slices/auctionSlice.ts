import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Auction {
    _id: string;
    title: string;
    description: string;
    images: string[];
    currentPrice: number;
    startingPrice: number;
    endTime: string;
    status: string;
    seller: {
        _id: string;
        username: string;
        avatar?: string;
    };
    totalBids: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface AuctionState {
    auctions: Auction[];
    currentAuction: Auction | null;
    pagination: Pagination | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuctionState = {
    auctions: [],
    currentAuction: null,
    pagination: null,
    isLoading: false,
    error: null,
};

const auctionSlice = createSlice({
    name: 'auction',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setAuctions: (state, action: PayloadAction<{ auctions: Auction[]; pagination: Pagination }>) => {
            state.auctions = action.payload.auctions;
            state.pagination = action.payload.pagination;
            state.isLoading = false;
        },
        setCurrentAuction: (state, action: PayloadAction<Auction>) => {
            state.currentAuction = action.payload;
            state.isLoading = false;
        },
        updateAuctionPrice: (state, action: PayloadAction<{ auctionId: string; price: number; totalBids: number }>) => {
            const { auctionId, price, totalBids } = action.payload;
            const auction = state.auctions.find(a => a._id === auctionId);
            if (auction) {
                auction.currentPrice = price;
                auction.totalBids = totalBids;
            }
            if (state.currentAuction?._id === auctionId) {
                state.currentAuction.currentPrice = price;
                state.currentAuction.totalBids = totalBids;
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearCurrentAuction: (state) => {
            state.currentAuction = null;
        },
    },
});

export const { setLoading, setAuctions, setCurrentAuction, updateAuctionPrice, setError, clearCurrentAuction } = auctionSlice.actions;
export default auctionSlice.reducer;
