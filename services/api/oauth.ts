import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { AuthResponse } from './auth';

export interface DiscordAuthResponse {
    code: string;
    state?: string;
}

export const oauthService = {
    /**
     * Exchange a Discord OAuth code for a JWT token
     * @param code Discord authorization code
     * @param codeVerifier Code verifier for PKCE
     */
    exchangeDiscordCode: async (code: string, codeVerifier: string | undefined): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.auth.discord,
            {
                code,
                codeVerifier: codeVerifier
            }
        );
        return response.data;
    }
}; 