import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform, Linking} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri, useAuthRequest, ResponseType, Prompt} from 'expo-auth-session';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@/navigation/navigation';

const DISCORD_CLIENT_ID = process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID || '';
const DISCORD_ENDPOINT = {
    authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
    tokenEndpoint: 'https://discord.com/api/oauth2/token',
    revocationEndpoint: 'https://discord.com/api/oauth2/token/revoke',
};
const REDIRECT_URI = 'tradeguard://auth/discord';
const SCOPES = ['identify', 'email'];

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface DiscordLoginButtonProps {
    onLoginStarted?: () => void;
    onLoginFailed?: (error: Error) => void;
}


export default function DiscordLoginButton({
                                               onLoginStarted,
                                               onLoginFailed
                                           }: DiscordLoginButtonProps) {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [request, response, promptAsync] = useAuthRequest(
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
    const handleLogin = async () => {
        try {
            console.log('Starting login flow...');
            setIsLoggingIn(true);
            onLoginStarted?.();

            // Start the OAuth flow using the promptAsync method from the hook.
            console.log('Calling promptAsync...');
            const result = await promptAsync({ showInRecents: true });
            console.log('Auth result:', result);

            // Handle the response from Discord.
            if (result.type === 'success') {
                console.log(
                    'Success! Code received:',
                    result.params.code?.substring(0, 5) + '...'
                );
                // Navigate to the DiscordAuth screen with the auth parameters.
                navigation.navigate('DiscordAuth', {
                    code: result.params.code,
                    state: result.params.state,
                    codeVerifier: request?.codeVerifier,
                });
            } else if (result.type === 'error') {
                console.error('Auth error:', result.error);
                //onLoginFailed?.(new Error(result.error));
            } else {
                console.log('Auth cancelled or dismissed');
                onLoginFailed?.(new Error('Authentication cancelled'));
            }
        } catch (error) {
            console.error('Discord login error:', error);
            onLoginFailed?.(error as Error);
        } finally {
            setIsLoggingIn(false);
        }
    };


    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoggingIn}
        >
            {isLoggingIn ? (
                <ActivityIndicator color="#FFFFFF" size="small"/>
            ) : (
                <View style={styles.buttonContent}>
                    <View style={styles.discordIconContainer}>
                        <Ionicons name="logo-discord" size={18} color="#FFFFFF"/>
                    </View>
                    <Text style={styles.buttonText}>Continue with Discord</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5865F2', // Discord brand color
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        flexDirection: 'row',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    discordIconContainer: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

})
