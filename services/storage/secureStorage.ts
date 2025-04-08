import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'jwt_token';
const PUSH_TOKEN = 'push_token';
/**
 * Secure storage service for storing and retrieving tokens
 */
export const secureStorage = {
    async setToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(JWT_KEY, token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    },
    async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(JWT_KEY);
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    },
    async removeToken(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(JWT_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    },
    async hasToken(): Promise<boolean> {
        try {
            const token = await this.getToken();
            return !!token;
        } catch (error) {
            console.error('Error checking token:', error);
            return false;
        }
    },
    async setPushToken(token:string): Promise<void> {
        try {
            await SecureStore.setItemAsync(PUSH_TOKEN, token);
        } catch (error) {
            console.error('Error storing push token:', error);
            throw error;
        }
    },
    async getPushToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(PUSH_TOKEN);
        } catch (error) {
            console.error('Error retrieving push token:', error);
            return null;
        }
    },
    async removePushToken(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(PUSH_TOKEN);
        } catch (error) {
            console.error('Error removing push token:', error);
            throw error;
        }
    },
}; 