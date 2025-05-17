import {useAuthRequest, Prompt, ResponseType} from 'expo-auth-session';
import {setDiscordCodeVerifier, getDiscordCodeVerifier} from '@/utils/OAuthTempStore';
import * as WebBrowser from 'expo-web-browser';

const DISCORD_CLIENT_ID = process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID || '';
const DISCORD_ENDPOINT = {
    authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
    tokenEndpoint: 'https://discord.com/api/oauth2/token',
    revocationEndpoint: 'https://discord.com/api/oauth2/token/revoke',
};
const REDIRECT_URI = 'tradeguard://auth/discord';
const SCOPES = ['identify', 'email'];

WebBrowser.maybeCompleteAuthSession();

export function useDiscordAuth() {
    const [request, _, promptAsync] = useAuthRequest(
        {
            clientId: DISCORD_CLIENT_ID,
            scopes: SCOPES,
            redirectUri: REDIRECT_URI,
            responseType: ResponseType.Code,
            prompt: Prompt.Consent,
            usePKCE: true,
        },
        DISCORD_ENDPOINT
    );

    const startDiscordAuth = async () => {
        if (!request?.codeVerifier) {
            throw new Error('Discord code verifier is missing in request');
        }
        setDiscordCodeVerifier(request.codeVerifier);
        console.log('Stored code verifier:', request.codeVerifier);
        
        const result = await promptAsync({showInRecents: true});
        if (result.type === 'success') {
            console.log("Successfully authorized via Discord");
            const storedVerifier = getDiscordCodeVerifier();
            if (!storedVerifier) {
                throw new Error('Code verifier was lost during auth flow');
            }
        } else if (result.type === 'error') {
            throw new Error(result.error?.message || 'Unknown Discord auth error');
        } else {
            throw new Error('Authentication cancelled');
        }
    };

    return {
        startDiscordAuth,
        isReady: !!request,
    };
}
