import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

interface BiometricAuthContextType {
    isBiometricEnabled: boolean;
    enableBiometric: () => Promise<void>;
    disableBiometric: () => void;
    checkBiometricAuth: () => Promise<boolean>;
}

const BiometricAuthContext = createContext<BiometricAuthContextType | undefined>(undefined);

export function BiometricAuthProvider({ children }: { children: React.ReactNode }) {
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { isBiometricAvailable, isBiometricEnrolled, authenticate } = useBiometricAuth();
    const { isAuthenticated, logout } = useAuth();

    // Load persisted biometric state on mount
    useEffect(() => {
        const loadBiometricState = async () => {
            try {
                const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
                setIsBiometricEnabled(enabled === 'true');
            } catch (error) {
                console.error('Error loading biometric state:', error);
            }
        };
        loadBiometricState();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [isBiometricEnabled, isAuthenticated]);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active' && isAuthenticated && isBiometricEnabled) {
            setRetryCount(0);
            await performAuthentication();
        }
    };

    const performAuthentication = async () => {
        try {
            const success = await authenticate();
            if (!success) {
                // If authentication fails, retry
                setRetryCount(prev => prev + 1);
                if (retryCount >= 9) { // 10th attempt failed
                    await logout();
                    return;
                }
                await performAuthentication();
                return;
            }
            setRetryCount(0);
        } catch (error) {
            console.error('Biometric authentication error:', error);
            // On error, retry
            setRetryCount(prev => prev + 1);
            if (retryCount >= 9) { // 10th attempt failed
                await logout();
                return;
            }
            await performAuthentication();
        }
    };

    const enableBiometric = async () => {
        if (!isBiometricAvailable || !isBiometricEnrolled) {
            throw new Error('Biometric authentication is not available on this device');
        }

        try {
            const success = await authenticate();
            if (!success) {
                throw new Error('Authentication failed');
            }
            setIsBiometricEnabled(true);
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
        } catch (error) {
            throw error;
        }
    };

    const disableBiometric = async () => {
        setIsBiometricEnabled(false);
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    };

    const checkBiometricAuth = async () => {
        if (!isBiometricEnabled) return true;

        setRetryCount(0);
        try {
            const success = await authenticate();
            if (!success) {
                // If authentication fails, retry
                setRetryCount(prev => prev + 1);
                if (retryCount >= 9) { // 10th attempt failed
                    await logout();
                    return false;
                }
                return checkBiometricAuth();
            }
            setRetryCount(0);
            return true;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            // On error, retry
            setRetryCount(prev => prev + 1);
            if (retryCount >= 9) { // 10th attempt failed
                await logout();
                return false;
            }
            return checkBiometricAuth();
        }
    };

    return (
        <BiometricAuthContext.Provider
            value={{
                isBiometricEnabled,
                enableBiometric,
                disableBiometric,
                checkBiometricAuth,
            }}
        >
            {children}
        </BiometricAuthContext.Provider>
    );
}

export function useBiometricAuthContext() {
    const context = useContext(BiometricAuthContext);
    if (context === undefined) {
        throw new Error('useBiometricAuthContext must be used within a BiometricAuthProvider');
    }
    return context;
} 