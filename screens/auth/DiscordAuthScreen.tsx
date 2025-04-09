import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/navigation';
import { oauthService } from '@/services/api/oauth';
import { useAuth } from '@/contexts/AuthContext';
import { usePushToken } from '@/contexts/PushTokenContext';
import {getDiscordCodeVerifier} from "@/utils/OAuthTempStore";

type DiscordAuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'DiscordAuth'>;

export default function DiscordAuthScreen({ route, navigation }: DiscordAuthScreenProps) {
    const [error, setError] = useState<string | null>(null);
    const { pushToken } = usePushToken();
    const { login } = useAuth();

    console.log('DiscordAuthScreen rendered with params:', route.params);
    const [handled, setHandled] = useState(false);

    useEffect(() => {
        if (handled) return;
        setHandled(true)
        console.log('DiscordAuthScreen: useEffect fired');
        const handleDiscordAuth = async () => {
            if (!route.params?.code) {
                console.error('No code found in route params, redirecting to Login');
                navigation.replace('Login');
                return;
            }
            try {
                const { code } = route.params;
                const codeVerifier = getDiscordCodeVerifier();
                if (!codeVerifier) {
                    console.error('Discord code verifier is missing');
                }
                const response = await oauthService.exchangeDiscordCode(code, codeVerifier, pushToken);
                console.info('Discord token received successfully');
                await login(response.token, response.user);

            } catch (error: any) {
                console.error('Discord auth error:', error);
                setError(error.message || 'Failed to authenticate with Discord');
                setTimeout(() => {
                    navigation.replace('Login');
                }, 3000);
            }
        };
        
        handleDiscordAuth();
    }, [route.params]);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>Authentication Failed</Text>
                        <Text style={styles.errorMessage}>{error}</Text>
                        <Text style={styles.redirectText}>Redirecting to login...</Text>
                    </View>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Completing Discord authentication...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    errorContainer: {
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 12,
    },
    errorMessage: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 24,
    },
    redirectText: {
        fontSize: 14,
        color: '#748CAB',
        fontStyle: 'italic',
    },
}); 