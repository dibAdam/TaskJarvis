'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated on mount
        const checkAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        const user = await authLogin(emailOrUsername, password);
        setUser(user);
        router.push('/dashboard');
        router.refresh(); // Refresh server components
    };

    const register = async (email: string, username: string, password: string) => {
        const user = await authRegister(email, username, password);
        setUser(user);
        router.push('/dashboard');
        router.refresh();
    };

    const logout = async () => {
        await authLogout();
        setUser(null);
        router.push('/login');
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}