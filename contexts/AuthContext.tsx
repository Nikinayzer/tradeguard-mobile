import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/services/redux/hooks';
import { checkAuthStatus, login, logout } from '@/services/redux/slices/authSlice';

interface User {
    username: string;
    email: string;
    firstName: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading, user } = useAppSelector(state => state.auth);

    useEffect(() => {
        dispatch(checkAuthStatus());
    }, []);

    const handleLogin = async (token: string, userData: User) => {
        await dispatch(login({ token, userData })).unwrap();
    };

    const handleLogout = async () => {
        await dispatch(logout()).unwrap();
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                login: handleLogin,
                logout: handleLogout,
            }}
        >
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
