import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {ThemedView} from "@/components/ui/ThemedView";
import {ThemedText} from "@/components/ui/ThemedText";
import {useTheme} from "@/contexts/ThemeContext";

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    type: AlertType;
    buttons?: AlertButton[];
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
        buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
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

    const {colors} = useTheme();
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
            statusBarTranslucent={true}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <ThemedView style={styles.alertContainer} variant={"modal"}>
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={getIconName()}
                                    size={32}
                                    color={getIconColor()}
                                />
                            </View>
                            <ThemedText style={styles.title} size={22}>{title}</ThemedText>
                            <ThemedText style={styles.message} size={16} color={colors.textTertiary}>{message}</ThemedText>
                            
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
                        </ThemedView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(13, 27, 42, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        elevation: 1000,
    },
    alertContainer: {
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
        zIndex: 1001,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
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
        color: '#d8d8d8',
    },
    buttonTextDestructive: {
        color: '#FFFFFF',
    },
}); 