import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';

export interface AuthResponse {
    twoFactorRequired: boolean;
    user: {
        username: string;
        email: string;
        firstName: string;
    }
    token?: string;
    expiration?: string;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
}

export interface PasswordChangeRequest{
    email: string;
}
export interface PasswordChangeRequestVerify{
    code: string;
    email: string;
    newPassword: string;
}
export interface TwoFactorVerification {
    email: string;
    code: string;
}

export const authApiService = {
    login: async (credentials: LoginCredentials, pushToken: string): Promise<AuthResponse> => {
        const response =
            await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials, {
                headers: {
                    'X-Push-Token': pushToken,
                },
            });
        return response.data;
    },

    verifyOTP: async (data: TwoFactorVerification, pushToken: string): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.verifyOTP, data, {
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
    requestPasswordChange: async (data: PasswordChangeRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.auth.requestPasswordChange, data);
    },
    verifyPasswordChange: async (data: PasswordChangeRequestVerify): Promise<AuthResponse> => {
        const response =
            await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.verifyPasswordChange, data);
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