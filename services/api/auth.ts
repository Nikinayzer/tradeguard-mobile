import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';

export interface AuthResponse {
    token: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.auth.register, data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.auth.logout);
    },
}; 