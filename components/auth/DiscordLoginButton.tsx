// DiscordLoginButton.tsx
import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useDiscordAuth} from '@/hooks/useDiscordAuth';

interface DiscordLoginButtonProps {
    onLoginStarted?: () => void;
    onLoginFailed?: (error: Error) => void;
    login?: boolean;
}

export default function DiscordLoginButton({
                                               onLoginStarted,
                                               onLoginFailed,
                                               login = true,
                                           }: DiscordLoginButtonProps) {
    const {startDiscordAuth, isReady} = useDiscordAuth();
    const [loading, setLoading] = React.useState(false);

    const handlePress = async () => {
        if (loading) return
        setLoading(true);
        try {
            onLoginStarted?.();
            await startDiscordAuth();
        } catch (err: any) {
            onLoginFailed?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={!isReady || loading}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small"/>
            ) : (
                <View style={styles.buttonContent}>
                    <View style={styles.discordIconContainer}>
                        <Ionicons name="logo-discord" size={18} color="#FFFFFF"/>
                    </View>
                    <Text style={styles.buttonText}>
                        {login ? 'Continue with Discord' : 'Connect Discord'}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5865F2',
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
});
