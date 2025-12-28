import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isLoading: boolean;
    modalOpen: string | null;
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    toast: {
        message: string;
        type: 'success' | 'error' | 'info';
    } | null;
}

const initialState: UIState = {
    isLoading: false,
    modalOpen: null,
    sidebarOpen: false,
    theme: 'light',
    toast: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setGlobalLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        openModal: (state, action: PayloadAction<string>) => {
            state.modalOpen = action.payload;
        },
        closeModal: (state) => {
            state.modalOpen = null;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
            state.toast = action.payload;
        },
        hideToast: (state) => {
            state.toast = null;
        },
    },
});

export const { setGlobalLoading, openModal, closeModal, toggleSidebar, setTheme, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
