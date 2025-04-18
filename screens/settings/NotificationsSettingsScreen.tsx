import React, {useState} from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/navigation/navigation";
import NotificationModal from "@/components/modals/NotificationModal";
import CooldownWarningModal from "@/components/modals/CooldownWarningModal";
import CooldownPromptModal from "@/components/modals/CooldownPromptModal";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedHeader } from "@/components/ui/ThemedHeader";
import { useTheme } from "@/contexts/ThemeContext";

type NotificationsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface ToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

function Toggle({value, onChange}: ToggleProps) {
    const { colors } = useTheme();
    
    return (
        <TouchableOpacity
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            style={styles.toggleButtonContainer}
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
        tradeAlerts: true,
        priceAlerts: true,
        securityAlerts: true,
        newsUpdates: false,
        marketingEmails: false,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const [showNotification, setShowNotification] = useState(false);
    const [showCooldownWarning, setShowCooldownWarning] = useState(false);
    const [showCooldownPrompt, setShowCooldownPrompt] = useState(false);

    const handleNotificationConfirm = () => {
        setShowNotification(false);
    };

    const handleCooldownWarningConfirm = () => {
        setShowCooldownWarning(false);
    };

    const handleCooldownPromptConfirm = (justification: string) => {
        setShowCooldownPrompt(false);
        console.log("Justification:", justification);
    };

    const renderMenuItem = (
        title: string,
        description: string,
        value: boolean,
        onChange: () => void
    ) => (
        <ThemedView
            variant="card"
            style={styles.menuItem}
            border
            rounded="medium"
            padding="medium"
        >
            <View style={styles.menuContent}>
                <ThemedText variant="bodyBold">{title}</ThemedText>
                <ThemedText variant="caption" secondary>{description}</ThemedText>
            </View>
            <Toggle value={value} onChange={onChange} />
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
                    {/* Trading Notifications */}
                    <View style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle}>
                            TRADING
                        </ThemedText>
                        
                        {renderMenuItem(
                            "Trade Alerts",
                            "Get notified about your trades",
                            notifications.tradeAlerts,
                            () => toggleNotification('tradeAlerts')
                        )}
                        
                        {renderMenuItem(
                            "Price Alerts",
                            "Get notified about price movements",
                            notifications.priceAlerts,
                            () => toggleNotification('priceAlerts')
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
                            notifications.securityAlerts,
                            () => toggleNotification('securityAlerts')
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
                            notifications.newsUpdates,
                            () => toggleNotification('newsUpdates')
                        )}
                        
                        {renderMenuItem(
                            "Marketing Emails",
                            "Receive marketing communications",
                            notifications.marketingEmails,
                            () => toggleNotification('marketingEmails')
                        )}
                    </View>
                    
                    {/* Example notifications with modals */}
                    <View style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle}>
                            EXAMPLE NOTIFICATIONS:
                        </ThemedText>

                        {/* Simple Notification Button */}
                        <ThemedView 
                            variant="card" 
                            border 
                            rounded="medium" 
                            style={styles.button}
                        >
                            <TouchableOpacity 
                                onPress={() => setShowNotification(true)}
                                style={styles.buttonContainer}
                            >
                                <ThemedText variant="bodyBold">Show Notification</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        {/* Cooldown Warning Button */}
                        <ThemedView 
                            variant="card" 
                            border 
                            rounded="medium" 
                            style={styles.button}
                        >
                            <TouchableOpacity 
                                onPress={() => setShowCooldownWarning(true)}
                                style={styles.buttonContainer}
                            >
                                <ThemedText variant="bodyBold">Show Cooldown Warning</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        {/* Cooldown with Prompt Button */}
                        <ThemedView 
                            variant="card" 
                            border 
                            rounded="medium" 
                            style={styles.button}
                        >
                            <TouchableOpacity 
                                onPress={() => setShowCooldownPrompt(true)}
                                style={styles.buttonContainer}
                            >
                                <ThemedText variant="bodyBold">Show Cooldown with Prompt</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Simple Notification Modal */}
            <NotificationModal
                visible={showNotification}
                onClose={() => setShowNotification(false)}
                title="Notification Settings"
                message="Your notification preferences have been updated successfully"
                type="success"
                buttonText="View Settings"
                onButtonPress={handleNotificationConfirm}
            />

            {/* Cooldown Warning Modal */}
            <CooldownWarningModal
                visible={showCooldownWarning}
                onClose={() => setShowCooldownWarning(false)}
                title="Warning"
                message="You are about to disable important trading notifications"
                cooldownSeconds={5}
                onConfirm={handleCooldownWarningConfirm}
            />

            {/* Cooldown with Prompt Modal */}
            <CooldownPromptModal
                visible={showCooldownPrompt}
                onClose={() => setShowCooldownPrompt(false)}
                title="Warning"
                message="You are about to disable all trading notifications"
                cooldownSeconds={10}
                promptText="Please explain why you want to disable all notifications"
                onConfirm={handleCooldownPromptConfirm}
            />
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    menuContent: {
        flex: 1,
    },
    button: {
        marginBottom: 8,
    },
    buttonContainer: {
        padding: 16,
        width: '100%',
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
});