import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useTheme } from '@/contexts/ThemeContext';
import CircularTimer from '../CircularTimer';
import BaseModal from './BaseModal';
import { AlertTriangle, AlertCircle } from 'lucide-react-native';

interface CooldownModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    cooldownSeconds: number;
    onComplete?: () => void;
    children?: React.ReactNode;
    buttonText?: string;
    onButtonPress?: () => void;
    isButtonEnabled?: boolean;
    isLoading?: boolean;
}

const CooldownModal: React.FC<CooldownModalProps> = ({
    visible,
    onClose,
    title,
    message,
    cooldownSeconds,
    onComplete,
    children,
    buttonText = 'Close',
    onButtonPress,
    isButtonEnabled = false,
    isLoading = false,
}) => {
    const { colors } = useTheme();

    const handleTimerComplete = () => {
        onComplete?.();
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            type="warning"
            showCloseButton={true}
            isLoading={isLoading}
        >
            <ThemedView variant="transparent" style={styles.content}>
                <View style={styles.titleContainer}>
                    <AlertCircle size={28} color={colors.error} style={styles.titleIcon} />
                    <ThemedText style={styles.title}>{title}</ThemedText>
                </View>
                
                <ThemedText variant="body" secondary style={styles.message}>{message}</ThemedText>

                <View style={styles.timerContainer}>
                    <CircularTimer
                        size={100}
                        strokeWidth={8}
                        seconds={cooldownSeconds}
                        onComplete={handleTimerComplete}
                    />
                </View>

                {children}

                {buttonText && onButtonPress && (
                    <ThemedButton
                        variant="primary"
                        onPress={onButtonPress}
                        disabled={!isButtonEnabled}
                        style={{
                            ...styles.button,
                            backgroundColor: colors.error,
                            opacity: isButtonEnabled ? 1 : 0.5
                        }}
                    >
                        <ThemedText style={{ color: '#FFFFFF' }}>{buttonText}</ThemedText>
                    </ThemedButton>
                )}
            </ThemedView>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    content: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 8,
        width: '100%',
    },
    titleIcon: {
        marginRight: 12,
    },
    title: {
        textAlign: 'left',
        fontSize: 26,
        fontWeight: '700',
        flex: 1,
        letterSpacing: -0.5,
        lineHeight: 32,
        paddingTop: 2,
    },
    message: {
        textAlign: 'center',
        marginBottom: 36,
        lineHeight: 24,
        paddingHorizontal: 8,
        fontSize: 16,
    },
    timerContainer: {
        marginVertical: 36,
        alignItems: 'center',
    },
    button: {
        width: '100%',
        marginTop: 28,
        height: 52,
        borderRadius: 26,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default CooldownModal; 