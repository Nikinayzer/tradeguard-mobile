import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { 
    Info, 
    AlertTriangle, 
    Bell, 
    TrendingUp, 
    BarChart2, 
    HeartPulse, 
    User, 
    ShoppingBag 
} from 'lucide-react-native';

export interface Notification {
    id: string;
    title: string;
    body: string;
    read: boolean;
    sentAt: string;
    data?: string;
    deepLink?: string;
    category: 'system' | 'marketing' | 'user' | 'trade' | 'market' | 'health';
    type: 'info' | 'warning';
}

interface NotificationItemProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
    const { colors } = useTheme();

    const getTypeIcon = () => {
        switch (notification.type) {
            case 'warning':
                return <AlertTriangle size={16} color={colors.warning} />;
            case 'info':
            default:
                return <Info size={16} color={colors.primary} />;
        }
    };

    const getCategoryIcon = () => {
        switch (notification.category) {
            case 'system':
                return <Bell size={14} color={colors.textSecondary} />;
            case 'trade':
                return <TrendingUp size={14} color={colors.textSecondary} />;
            case 'market':
                return <BarChart2 size={14} color={colors.textSecondary} />;
            case 'health':
                return <HeartPulse size={14} color={colors.textSecondary} />;
            case 'user':
                return <User size={14} color={colors.textSecondary} />;
            case 'marketing':
                return <ShoppingBag size={14} color={colors.textSecondary} />;
            default:
                return <Bell size={14} color={colors.textSecondary} />;
        }
    };

    const containerStyle: ViewStyle = {
        ...styles.container,
        ...(notification.read && { backgroundColor: `${colors.background}E6` })
    };

    return (
        <TouchableOpacity
            onPress={() => onPress(notification)}
            activeOpacity={0.7}
        >
            <ThemedView 
                variant="card" 
                rounded 
                padding="medium"
                style={containerStyle}
            >
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        {!notification.read && (
                            <ThemedView 
                                style={{
                                    ...styles.unreadDot,
                                    backgroundColor: colors.primary
                                }}
                                rounded="full"
                            >
                                <View />
                            </ThemedView>
                        )}
                        <View style={styles.titleWrapper}>
                            <ThemedText variant="bodyBold" numberOfLines={1}>
                                {notification.title}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText variant="caption" secondary>
                        {(() => {
                            const date = new Date(notification.sentAt);
                            return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, h:mm a');
                        })()}
                    </ThemedText>
                </View>

                <View style={styles.categoryContainer}>
                    {getCategoryIcon()}
                    <ThemedText 
                        variant="caption" 
                        secondary
                        style={styles.category}
                    >
                        {notification.category}
                    </ThemedText>
                </View>
                
                <ThemedText 
                    variant="body" 
                    secondary 
                    style={styles.body}
                    numberOfLines={2}
                >
                    {notification.body}
                </ThemedText>
            </ThemedView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 8,
    },
    titleWrapper: {
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        marginRight: 4,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    category: {
        textTransform: 'capitalize',
        fontSize: 12,
    },
    body: {
        lineHeight: 20,
    },
}); 