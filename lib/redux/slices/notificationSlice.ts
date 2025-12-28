import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedAuction?: {
        _id: string;
        title: string;
    };
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setNotifications: (state, action: PayloadAction<{ notifications: Notification[]; unreadCount: number }>) => {
            state.notifications = action.payload.notifications;
            state.unreadCount = action.payload.unreadCount;
            state.isLoading = false;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n._id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        },
    },
});

export const { setLoading, setNotifications, addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
