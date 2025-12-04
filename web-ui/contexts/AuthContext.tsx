'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, login as authLogin, register as authRegister, logout as authLogout, getCurrentUser, isAuthenticated as checkAuth } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from stored tokens
    useEffect(() => {
        async function initAuth() {
            try {
                if (checkAuth()) {
                    const userData = await getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                // Clear invalid tokens
                authLogout();
            } finally {
                setLoading(false);
            }
        }

        initAuth();
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        setLoading(true);
        try {
            const userData = await authLogin(emailOrUsername, password);
            setUser(userData);
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, username: string, password: string) => {
        setLoading(true);
        try {
            const userData = await authRegister(email, username, password);
            setUser(userData);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        authLogout();
    };

    const value = {
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
