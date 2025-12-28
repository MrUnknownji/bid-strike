import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Bid {
    _id: string;
    auction: string;
    bidder: {
        _id: string;
        username: string;
        avatar?: string;
    };
    amount: number;
    timestamp: string;
    isWinning: boolean;
}

interface BidState {
    bids: Bid[];
    myBids: Bid[];
    isLoading: boolean;
    error: string | null;
}

const initialState: BidState = {
    bids: [],
    myBids: [],
    isLoading: false,
    error: null,
};

const bidSlice = createSlice({
    name: 'bid',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setBids: (state, action: PayloadAction<Bid[]>) => {
            state.bids = action.payload;
            state.isLoading = false;
        },
        addBid: (state, action: PayloadAction<Bid>) => {
            state.bids.forEach(b => b.isWinning = false);
            state.bids.unshift(action.payload);
        },
        setMyBids: (state, action: PayloadAction<Bid[]>) => {
            state.myBids = action.payload;
            state.isLoading = false;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearBids: (state) => {
            state.bids = [];
        },
    },
});

export const { setLoading, setBids, addBid, setMyBids, setError, clearBids } = bidSlice.actions;
export default bidSlice.reducer;
