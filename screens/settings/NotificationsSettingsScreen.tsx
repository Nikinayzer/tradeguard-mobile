import React, {useState} from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/navigation/navigation";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedHeader } from "@/components/ui/ThemedHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { Bell, AlertTriangle, Newspaper, Mail, Heart, HeartPulse } from "lucide-react-native";

type NotificationsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface ToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    isDisabled?: boolean;
}

function Toggle({value, onChange, isDisabled}: ToggleProps) {
    const { colors } = useTheme();
    
    return (
        <TouchableOpacity
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            style={styles.toggleButtonContainer}
            disabled={isDisabled}
        >
            <View
                style={[
                    styles.toggleButton, 
                    { 
                        backgroundColor: value ? 
                            colors.primary : 
                            colors.backgroundTertiary 
                    }
                ]}
            >
                <View style={[
                    styles.toggleHandle, 
                    { backgroundColor: colors.buttonPrimaryText },
                    value ? styles.toggleHandleActive : styles.toggleHandleInactive
                ]}/>
            </View>
        </TouchableOpacity>
    );
}

export default function NotificationsSettingsScreen() {
    const navigation = useNavigation<NotificationsScreenNavigationProp>();
    const { colors } = useTheme();
    
    const [notifications, setNotifications] = React.useState({
        jobAlerts: true,
        priceAlerts: false,
        securityAlerts: false,
        newsUpdates: false,
        marketingEmails: false,
        riskAlerts: true,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const renderMenuItem = (
        title: string,
        description: string,
        icon: React.ReactNode,
        value: boolean,
        onChange: () => void,
        isDisabled?: boolean
    ) => (
        <ThemedView
            variant="card"
            style={styles.menuItem}
            rounded="medium"
            padding="medium"
        >
            {/* Icon Column */}
            <View style={styles.iconColumn}>
                {React.cloneElement(icon as React.ReactElement, {
                    size: 20,
                    color: colors.primary,
                    strokeWidth: 2
                })}
            </View>

            {/* Content Column */}
            <View style={styles.contentColumn}>
                <ThemedText variant="bodyBold">{title}</ThemedText>
                <ThemedText variant="caption" secondary>{description}</ThemedText>
            </View>

            {/* Action Column */}
            <View style={styles.actionColumn}>
                <Toggle value={value} onChange={onChange} isDisabled={isDisabled} />
            </View>
        </ThemedView>
    );

    return (
        <ThemedView variant="screen" style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <ThemedHeader
                    title="Notifications"
                    canGoBack={true}
                    onBack={() => navigation.goBack()}
                />

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView 
                        variant="card" 
                        style={styles.noteContainer}
                        rounded="medium"
                        padding="medium"
                    >
                        <ThemedText variant="heading2" style={styles.noteEmoji}>
                            🚧
                        </ThemedText>
                        <ThemedText variant="body" style={styles.noteText}>
                            Oops! We're still putting the finishing touches on notifications. 
                            {"\n\n"}
                            Don't worry though - we'll let you know as soon as you can customize your alerts. In the meantime, we've set up some smart defaults to keep you in the loop! 
                            {"\n\n"}
                            We'll spam you with notifications and you'll like it... for now!
                        </ThemedText>
                    </ThemedView>

                    {/* Trading Notifications */}
                    <View style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle}>
                            TRADING
                        </ThemedText>
                        
                        {renderMenuItem(
                            "Job Alerts",
                            "Get notified about your trading jobs",
                            <Bell />,
                            notifications.jobAlerts,
                            () => toggleNotification('jobAlerts'),
                            true
                        )}
                        
                        {renderMenuItem(
                            "Price Alerts",
                            "Get notified about price movements",
                            <AlertTriangle />,
                            notifications.priceAlerts,
                            () => toggleNotification('priceAlerts'),
                            true
                        )}
                    </View>

                    {/* Health & Risk Section */}
                    <View style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle}>
                            HEALTH & RISK
                        </ThemedText>
                        
                        {renderMenuItem(
                            "Risk Alerts",
                            "Get notified when your portfolio risk level changes",
                            <HeartPulse />,
                            notifications.riskAlerts,
                            () => toggleNotification('riskAlerts'),
                            true
                        )}
                    </View>

                    {/* Security Notifications */}
                    <View style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle}>
                            SECURITY
                        </ThemedText>
                        
                        {renderMenuItem(
                            "Security Alerts",
                            "Get notified about security events",
                            <AlertTriangle />,
                            notifications.securityAlerts,
                            () => toggleNotification('securityAlerts'),
                            true
                        )}
                    </View>

                    {/* Marketing Notifications */}
                    <View style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle}>
                            MARKETING
                        </ThemedText>
                        
                        {renderMenuItem(
                            "News Updates",
                            "Receive news and updates",
                            <Newspaper />,
                            notifications.newsUpdates,
                            () => toggleNotification('newsUpdates'),
                            true
                        )}
                        
                        {renderMenuItem(
                            "Marketing Emails",
                            "Receive marketing communications",
                            <Mail />,
                            notifications.marketingEmails,
                            () => toggleNotification('marketingEmails'),
                            true
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        textTransform: "uppercase",
        paddingLeft: 4,
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    iconColumn: {
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    contentColumn: {
        flex: 1,
        marginHorizontal: 12,
    },
    actionColumn: {
        width: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    toggleButtonContainer: {
        padding: 4,
    },
    toggleButton: {
        width: 44,
        height: 26,
        borderRadius: 13,
        padding: 2,
    },
    toggleHandle: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
    toggleHandleActive: {
        transform: [{translateX: 18}],
    },
    toggleHandleInactive: {
        transform: [{translateX: 0}],
    },
    noteContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    noteEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    noteText: {
        lineHeight: 22,
        textAlign: 'center',
    },
});