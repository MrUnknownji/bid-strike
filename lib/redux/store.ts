import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import auctionReducer from './slices/auctionSlice';
import bidReducer from './slices/bidSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        auction: auctionReducer,
        bid: bidReducer,
        notification: notificationReducer,
        ui: uiReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
