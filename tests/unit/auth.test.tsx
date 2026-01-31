import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock useRouter
mock.module('next/navigation', () => ({
    useRouter: () => ({
        push: mock(),
        replace: mock(),
        prefetch: mock(),
    }),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: { id: '1', username: 'testuser' } })
} as unknown as Response));

function TestComponent() {
    const { user, login, logout } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? user.username : 'null'}</div>
            <button onClick={() => login('fake-token', { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' })}>Login</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('provides initial null user', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(getByTestId('user').textContent).toBe('null');
    });

    it('logs in user', async () => {
        const { getByText, getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            getByText('Login').click();
        });

        await waitFor(() => {
            expect(getByTestId('user').textContent).toBe('testuser');
        });

        expect(localStorage.getItem('accessToken')).toBe('fake-token');
    });

    it('logs out user', async () => {
        localStorage.setItem('accessToken', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ id: '1', username: 'testuser' }));

        const { getByText, getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Should be logged in initially due to localStorage
        await waitFor(() => {
             expect(getByTestId('user').textContent).toBe('testuser');
        });

        act(() => {
            getByText('Logout').click();
        });

        await waitFor(() => {
            expect(getByTestId('user').textContent).toBe('null');
        });

        expect(localStorage.getItem('accessToken')).toBeNull();
    });
});
