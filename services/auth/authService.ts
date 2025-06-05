import {secureStorage} from '@/services/storage/secureStorage';
import {profileService} from '@/services/api/profile';
import {authApiService as apiAuthService, authApiService} from '@/services/api/auth';

export interface User {
    username: string;
    email: string;
    firstName: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}

export const authService = {
    checkAuthStatus: async (): Promise<User | null> => {
        const hasToken = await secureStorage.hasToken();
        if (!hasToken) return null;

        try {
            await authApiService.validate();
        } catch (error) {
            //await secureStorage.removeToken();
            return null;
        }

        return null;
    },

    login: async (token: string, userData: User): Promise<User> => {
        await secureStorage.setToken(token);
        return userData;
    },

    logout: async (): Promise<void> => {
        await secureStorage.removeToken();
    },

    getAuthState: (user: User | null): AuthState => ({
        isAuthenticated: !!user,
        isLoading: false,
        user
    })
}; 