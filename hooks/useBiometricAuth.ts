import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '@/contexts/AuthContext';

const MAX_RETRIES = 10;

export const useBiometricAuth = () => {
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        checkBiometricAvailability();
    }, []);

    const checkBiometricAvailability = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            setIsBiometricAvailable(hasHardware);
            setIsBiometricEnrolled(isEnrolled);
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            setIsBiometricAvailable(false);
            setIsBiometricEnrolled(false);
        }
    };

    const authenticate = async (retryCount = 0): Promise<boolean> => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to continue',
                disableDeviceFallback: true,
                cancelLabel: 'Cancel',
            });

            if (!result.success) {
                // If authentication failed and we haven't reached max retries, try again
                if (retryCount < MAX_RETRIES) {
                    return authenticate(retryCount + 1);
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            // If there was an error and we haven't reached max retries, try again
            if (retryCount < MAX_RETRIES) {
                return authenticate(retryCount + 1);
            }
            return false;
        }
    };

    return {
        isBiometricAvailable,
        isBiometricEnrolled,
        authenticate,
        checkBiometricAvailability,
    };
}; 