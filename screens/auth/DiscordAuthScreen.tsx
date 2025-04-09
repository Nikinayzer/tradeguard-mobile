import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { oauthService } from '@/services/api/oauth';
import { usePushToken } from '@/contexts/PushTokenContext';

type DiscordAuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'DiscordAuth'>;

export default function DiscordAuthScreen({ route, navigation }: DiscordAuthScreenProps) {
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    // Log route params for debugging
    console.log('DiscordAuthScreen mounted with params:', route.params);
    
    useEffect(() => {
        const handleDiscordAuth = async () => {
            try {
                // If there's no code in the route params, return to login screen
                if (!route.params?.code) {
                    console.log('No code found in route params, redirecting to Login');
                    navigation.replace('Login');
                    return;
                }

                const { code, codeVerifier } = route.params;
                console.log('Exchanging code for token. Code starts with:', code.substring(0, 5) + '...');
                
                // Exchange the code for a JWT token
                const response = await oauthService.exchangeDiscordCode(code, codeVerifier );
                console.log('Token received successfully');
                
                // Login with the received token
                await login(response.token, {
                    // These values will be updated when the profile is fetched
                    id: 'discord_user',
                    name: 'Discord User',
                    email: '',
                });
                
                // Auth context will redirect to main app
            } catch (error: any) {
                console.error('Discord auth error:', error);
                setError(error.message || 'Failed to authenticate with Discord');
                
                // Wait 3 seconds and redirect to login
                setTimeout(() => {
                    navigation.replace('Login');
                }, 3000);
            }
        };
        
        handleDiscordAuth();
    }, [route.params, login, navigation]);
    
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