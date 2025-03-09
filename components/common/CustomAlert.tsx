import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    type: AlertType;
}

export interface AlertButton {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps extends AlertState {
    onClose: () => void;
    buttons?: AlertButton[];
}

export const useAlert = (initialState: Partial<AlertState> = {}) => {
    const [alert, setAlert] = React.useState<AlertState>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        ...initialState,
    });

    const showAlert = (params: Partial<AlertState>) => {
        setAlert({
            ...alert,
            visible: true,
            ...params,
        });
    };

    const hideAlert = () => {
        setAlert((prev) => ({
            ...prev,
            visible: false,
        }));
    };

    return {
        alert,
        showAlert,
        hideAlert,
    };
};

export default function CustomAlert({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    buttons = [{ text: 'OK', onPress: () => {}, style: 'default' }],
}: CustomAlertProps) {
    const getIconName = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'alert-circle';
            case 'warning':
                return 'warning';
            default:
                return 'information-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return '#10B981';
            case 'error':
                return '#EF4444';
            case 'warning':
                return '#F59E0B';
            default:
                return '#3B82F6';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.alertContainer}>
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={getIconName()}
                                    size={32}
                                    color={getIconColor()}
                                />
                            </View>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>
                            <View style={styles.buttonContainer}>
                                {buttons.map((button, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            button.style === 'cancel' && styles.buttonCancel,
                                            button.style === 'destructive' && styles.buttonDestructive,
                                            index > 0 && { marginLeft: 8 },
                                        ]}
                                        onPress={() => {
                                            button.onPress();
                                            onClose();
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                button.style === 'cancel' && styles.buttonTextCancel,
                                                button.style === 'destructive' && styles.buttonTextDestructive,
                                            ]}
                                        >
                                            {button.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(13, 27, 42, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        backgroundColor: '#1B263B',
        borderRadius: 16,
        padding: 24,
        width: width * 0.85,
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#748CAB',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        flex: 1,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#374151',
    },
    buttonDestructive: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextCancel: {
        color: '#748CAB',
    },
    buttonTextDestructive: {
        color: '#FFFFFF',
    },
}); 