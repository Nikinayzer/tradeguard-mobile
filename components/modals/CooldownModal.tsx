import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationModal from './NotificationModal';
import CircularTimer from '../CircularTimer';

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
    const handleTimerComplete = () => {
        onComplete?.();
    };

    return (
        <NotificationModal
            visible={visible}
            onClose={onClose}
            title={title}
            message={message}
            type="warning"
            buttonText={buttonText}
            onButtonPress={onButtonPress}
            isButtonEnabled={isButtonEnabled}
            isLoading={isLoading}
            showCloseButton={true}
        >
            <View style={styles.timerContainer}>
                <CircularTimer
                    size={80}
                    strokeWidth={8}
                    seconds={cooldownSeconds}
                    color="#F59E0B"
                    onComplete={handleTimerComplete}
                />
            </View>
            {children}
        </NotificationModal>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },
});

export default CooldownModal; 