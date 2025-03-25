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
    maxSingleJobLimit: string;
    maxDailyTradingLimit: string;
    maxPortfolioRisk: string;
    maxConcurrentOrders: string;
    maxDailyTrades: string;
    tradingCooldown: string;
    allowDcaForce: boolean;
    allowLiqForce: boolean;
    dailyLossLimit: string;
    maxConsecutiveLosses: string;
    maxDailyBalanceChange: string;
    volatilityLimit: string;
    liquidityThreshold: string;
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

    updateLimits: async (data: UserAccountLimits): Promise<void> => {
        console.log(data)
        await apiClient.post(API_ENDPOINTS.profile.updateLimits, data);
    }
};