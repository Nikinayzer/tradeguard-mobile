import React, {useEffect, useRef} from 'react';
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Animated,
    Platform
} from 'react-native';
import {X} from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import tinycolor from 'tinycolor2';

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    type?: 'warning' | 'success' | 'error' | 'info';
    showCloseButton?: boolean;
    children?: React.ReactNode;
    isLoading?: boolean;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;

const BaseModal: React.FC<BaseModalProps> = ({
    visible,
    onClose,
    type = 'info',
    showCloseButton = true,
    children,
    isLoading = false,
}) => {
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    damping: 15,
                    mass: 1,
                    stiffness: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getTypeColor = () => {
        switch (type) {
            case 'warning':
                return colors.warning;
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            default:
                return colors.primary;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: fadeAnim }
                ]}
            >
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{scale: scaleAnim}],
                            width: MODAL_WIDTH,
                            ...Platform.select({
                                ios: {
                                    shadowColor: colors.text,
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                },
                                android: {
                                    elevation: 8,
                                },
                            }),
                        }
                    ]}
                >
                    <ThemedView
                        variant="modal"
                        style={styles.modalContent}
                        border
                        rounded="large"
                    >
                        {showCloseButton && (
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                            >
                                <X size={24} color={colors.textTertiary}/>
                            </TouchableOpacity>
                        )}
                        <ThemedView style={styles.content}>
                            {children}
                            {isLoading && (
                                <ThemedView style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={getTypeColor()}/>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </ThemedView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        maxHeight: '80%',
    },
    modalContent: {
        padding: 24,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        borderRadius: 20,
        zIndex: 1,
    },
    content: {
        alignItems: 'center',
    },
    loadingContainer: {
        marginTop: 16,
    },
});

export default BaseModal; 