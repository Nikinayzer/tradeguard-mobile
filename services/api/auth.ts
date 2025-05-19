import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';

export interface AuthResponse {
    token: string;
    user: {
        username: string;
        email: string;
        firstName: string;
    }
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export const authService = {
    login: async (credentials: LoginCredentials, pushToken: string): Promise<AuthResponse> => {
        const response =
            await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials, {
                headers: {
                    'X-Push-Token': pushToken,
                },
            });
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response =
            await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
        return response.data;
    },

    logout: async (pushToken:string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.auth.logout, pushToken,{
            headers: {
                'X-Push-Token': pushToken,
            },
        });
    },
    validate: async (): Promise<void> => {
        await apiClient.get(API_ENDPOINTS.auth.validate);
    }
}; 