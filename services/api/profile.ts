import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    registeredAt: string; // Instant
    updatedAt: string;
    roles: Role[];
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
}

export interface UserUpdateRequest {
    email: string;
    firstName: string;
    lastName: string;
}

export interface UserAccountLimits {
    id: number;
    userId: number;
    dailyTradingLimit: string; // BigDecimal
    maximumLeverage: string;
    tradingCooldown: string; // Duration = ISO 8601
    dailyLossLimit: string;
}

export interface UserAccountLimitsRequest {
    dailyTradingLimit: string;
    maximumLeverage: string;
    tradingCooldown: string;
    dailyLossLimit: string;
}

export const profileService = {
    getMe: async (): Promise<User> => {
        const response = await apiClient.get<User>(API_ENDPOINTS.profile.getMe);
        return response.data;
    },

    updateMe: async (data: UserUpdateRequest): Promise<void> => {
        const response = await apiClient.post(API_ENDPOINTS.profile.updateMe, data);
        return response.data;
    },

    getLimits: async (): Promise<UserAccountLimits> => {
        const response = await apiClient.get<UserAccountLimits>(API_ENDPOINTS.profile.getLimits);
        return response.data;
    },
    updateLimits: async (data: UserAccountLimitsRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.profile.updateLimits, data);
    }
};