import React, {useState, useCallback, useEffect} from 'react';
import { StyleSheet, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Notification } from '@/components/notifications/NotificationItem';
import { SwipeableNotification } from '@/components/notifications/SwipeableNotification';
import { useTheme } from '@/contexts/ThemeContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Bell } from 'lucide-react-native';
import Constants from 'expo-constants';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { useNavigation } from '@react-navigation/native';
import {profileService} from "@/services/api";


export default function NotificationsScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedNotifications: Notification[] = await profileService.getNotifications();
            console.log('Fetched notifications:', fetchedNotifications);
            setNotifications(fetchedNotifications);
        } catch (error) {
            setIsError(true)
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const { isRefreshing, handleRefresh } = usePullToRefresh({
        onRefresh: fetchNotifications,
        refreshDelay: 1000
    });

    const handleNotificationPress = useCallback((notification: Notification) => {
        // TODO: Handle notification press (Mark + navigate if deep link)
        console.log('Notification pressed:', notification);
    }, []);

    const handleMarkAsRead = useCallback(async (notification: Notification) => {
        await profileService.markAsReadNotification(notification.id);
        setNotifications(prev =>
            prev.map(n => 
                n.id === notification.id 
                    ? { ...n, read: true }
                    : n
            )
        );
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const renderEmptyState = () => (
        <ThemedView variant="screen" style={styles.emptyContainer}>
            <Bell size={48} color={colors.textSecondary} />
            <ThemedText variant="bodyBold" style={styles.emptyTitle}>
                No Notifications
            </ThemedText>
            <ThemedText variant="body" secondary style={styles.emptyText}>
                You don't have any notifications yet
            </ThemedText>
        </ThemedView>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { marginTop: Constants.statusBarHeight }]}>
            <ThemedView variant="screen" style={styles.container}>
                <ThemedHeader
                    title="Notifications"
                    canGoBack
                    onBack={() => navigation.goBack()}
                    canRefresh
                    onRefresh={fetchNotifications}
                />

                <FlatList
                    data={notifications}
                    renderItem={({ item }) => (
                        <SwipeableNotification
                            notification={item}
                            onPress={handleNotificationPress}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
    },
}); 