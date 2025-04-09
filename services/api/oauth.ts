import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';
import {AuthResponse} from './auth';

export const oauthService = {
    /**
     * Exchange a Discord OAuth code for a JWT token
     * @param code Discord authorization code
     * @param codeVerifier Code verifier for PKCE
     * @param pushToken Push notification token
     */
    exchangeDiscordCode: async (code: string, codeVerifier: string | undefined, pushToken: string): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.auth.discord,
            {
                code,
                codeVerifier
            },
            {
                headers: {
                    'X-Push-Token': pushToken,
                },
            }
        );
        return response.data;
    }
}; 