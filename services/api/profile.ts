import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';

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
    discordAccount?: {
        username: string;
        discordId: string;
        avatar: string;
    };
    exchangeAccounts?: Array<ExchangeAccount>;
}

export interface ExchangeAccount {
    id?: number;
    provider?: string;
    demo?: boolean;
    name: string;
    readWriteApiKey: string;
    readWriteApiSecret: string;
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
    dailyLossLimit: string;
    maxDailyBalanceChange: string;
}

export interface UserSecuritySettings {
    twoFactorEnabled: boolean;
    lastPasswordChangeDate?: string;
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
    getExchangeAccount: async (id: string): Promise<ExchangeAccount> => {
        const response = await apiClient.get<ExchangeAccount>(API_ENDPOINTS.profile.getExchangeAccount(id));
        return response.data;
    },
    getSecuritySettings: async (): Promise<UserSecuritySettings> => {
        const response = await apiClient.get(API_ENDPOINTS.profile.getSecuritySettings);
        return response.data;
    },
    updateSecuritySettings: async (data: UserSecuritySettings): Promise<void> => {
        const response = await apiClient.post(API_ENDPOINTS.profile.updateSecuritySettings, data);
        return response.data;
    },
    updateExchangeAccount: async (id: string, data: ExchangeAccount): Promise<void> => {
        const response = await apiClient.post(API_ENDPOINTS.profile.updateExchangeAccount(id), data);
        return response.data;
    },
    addExchangeAccount: async (data: ExchangeAccount): Promise<void> => {
        const response = await apiClient.post(API_ENDPOINTS.profile.addExchangeAccount, data);
        return response.data;
    },
    deleteExchangeAccount: async (id: string): Promise<void> => {
        const response = await apiClient.delete(API_ENDPOINTS.profile.deleteExchangeAccount(id));
        return response.data;
    },
    getLimits: async (): Promise<UserAccountLimits> => {
        const response = await apiClient.get<UserAccountLimits>(API_ENDPOINTS.profile.getLimits);
        return response.data;
    },
    updateLimits: async (data: UserAccountLimits): Promise<void> => {
        console.log(data)
        await apiClient.post(API_ENDPOINTS.profile.updateLimits, data);
    },
    getNotifications: async (): Promise<any> => {
        const response = await apiClient.get(API_ENDPOINTS.profile.getNotifications);
        return response.data;
    },
    markAsReadNotification: async (notificationId: string): Promise<void>=> {
        await apiClient.post(API_ENDPOINTS.profile.markAsReadNotification(notificationId));
    }
};