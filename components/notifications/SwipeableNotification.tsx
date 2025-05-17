import React, { useRef, useCallback } from 'react';
import { StyleSheet, Animated, View, ViewStyle } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { NotificationItem, Notification } from './NotificationItem';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface SwipeableNotificationProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
    onMarkAsRead: (notification: Notification) => Promise<void>;
}
// todo replace swipeable, consult docs. Not the main priority.
export function SwipeableNotification({ 
    notification, 
    onPress, 
    onMarkAsRead 
}: SwipeableNotificationProps) {
    const { colors } = useTheme();
    const swipeableRef = useRef<Swipeable>(null);
    const [isRead, setIsRead] = React.useState(notification.read);

    const handleMarkAsRead = useCallback(async () => {
        if (isRead) return;
        
        try {
            await onMarkAsRead(notification);
            setIsRead(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            swipeableRef.current?.close();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            swipeableRef.current?.close();
        }
    }, [notification, isRead, onMarkAsRead]);

    const renderLeftActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const scale = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        const buttonStyle: ViewStyle = {
            ...styles.markAsReadButton,
            backgroundColor: colors.primary
        };

        return (
            <Animated.View style={[styles.leftAction, { transform: [{ scale }] }]}>
                <ThemedView 
                    variant="section" 
                    style={buttonStyle}
                    rounded="full"
                >
                    <Check size={20} color={colors.buttonPrimaryText} />
                </ThemedView>
            </Animated.View>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            friction={1}
            leftThreshold={20}
            rightThreshold={20}
            renderLeftActions={renderLeftActions}
            onSwipeableOpen={handleMarkAsRead}
            enabled={!isRead}
            overshootLeft={false}
        >
            <NotificationItem
                notification={{
                    ...notification,
                    read: isRead
                }}
                onPress={onPress}
            />
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    leftAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
    },
    markAsReadButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
}); 