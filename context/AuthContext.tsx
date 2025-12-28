'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadUser = () => {
            const stored = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');
            if (stored && token) {
                try {
                    setUser(JSON.parse(stored));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            if (token) {
                refreshUser();
            } else {
                setIsLoading(false);
            }
        };

        loadUser();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user' || e.key === 'accessToken') {
                loadUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates if needed (though context methods handle this)
        window.addEventListener('auth-update', loadUser);

        // Check auth status every minute
        const interval = setInterval(() => {
            const token = localStorage.getItem('accessToken');
            if (token) refreshUser();
        }, 60000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-update', loadUser);
            clearInterval(interval);
        };
    }, []);

    const login = useCallback((token: string, userData: User) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
