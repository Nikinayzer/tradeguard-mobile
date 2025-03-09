import React, {useEffect, useRef} from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Animated,
    Platform
} from 'react-native';
import {X} from 'lucide-react-native';

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
                return '#F59E0B';
            case 'success':
                return '#10B981';
            case 'error':
                return '#EF4444';
            default:
                return '#3B82F6';
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
                    {opacity: fadeAnim}
                ]}
            >
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{scale: scaleAnim}],
                            backgroundColor: '#1B263B',
                            borderRadius: 24,
                            padding: 24,
                            width: MODAL_WIDTH,
                            ...Platform.select({
                                ios: {
                                    shadowColor: '#000',
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
                    {showCloseButton && !isLoading && (
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        >
                            <X size={24} color="#748CAB"/>
                        </TouchableOpacity>
                    )}
                    <View style={styles.content}>
                        {children}
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={getTypeColor()}/>
                            </View>
                        )}
                    </View>
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