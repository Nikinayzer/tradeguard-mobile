import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react-native';
import BaseModal from './BaseModal';

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'warning' | 'success' | 'error' | 'info';
    buttonText?: string;
    onButtonPress?: () => void;
    showCloseButton?: boolean;
    isLoading?: boolean;
    isButtonEnabled?: boolean;
    children?: React.ReactNode;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    visible,
    onClose,
    title,
    message,
    type = 'info',
    buttonText,
    onButtonPress,
    showCloseButton = true,
    isLoading = false,
    isButtonEnabled = true,
    children,
}) => {
    const getTypeColor = () => {
        switch (type) {
            case 'success':
                return '#10B981';
            case 'warning':
                return '#F59E0B';
            case 'error':
                return '#EF4444';
            default:
                return '#3B82F6';
        }
    };

    const getTypeIcon = () => {
        const color = getTypeColor();
        const size = 24;
        switch (type) {
            case 'success':
                return <CheckCircle2 size={size} color={color} />;
            case 'warning':
                return <AlertCircle size={size} color={color} />;
            case 'error':
                return <XCircle size={size} color={color} />;
            default:
                return <Info size={size} color={color} />;
        }
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            type={type}
            showCloseButton={showCloseButton}
            isLoading={isLoading}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor()}20` }]}>
                    {getTypeIcon()}
                </View>
                <View style={styles.messageContainer}>
                    <Text style={[styles.title, { color: getTypeColor() }]}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
            {children}
            {buttonText && onButtonPress && (
                <TouchableOpacity 
                    style={[
                        styles.button,
                        { backgroundColor: getTypeColor() },
                        !isButtonEnabled && styles.buttonDisabled
                    ]}
                    onPress={onButtonPress}
                    disabled={!isButtonEnabled}
                >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            )}
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    messageContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#E2E8F0',
        lineHeight: 20,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default NotificationModal; 