import React, {useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/types/navigation";
import NotificationModal from "@/components/modals/NotificationModal";
import CooldownWarningModal from "@/components/modals/CooldownWarningModal";
import CooldownPromptModal from "@/components/modals/CooldownPromptModal";

type NotificationsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function NotificationsSettingsScreen() {
    const navigation = useNavigation<NotificationsScreenNavigationProp>();
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color="#3B82F6" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Notifications</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Trading Notifications */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trading</Text>
                        <View style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuText}>Trade Alerts</Text>
                                <Text style={styles.menuDescription}>Get notified about your trades</Text>
                            </View>
                            <Switch
                                value={notifications.tradeAlerts}
                                onValueChange={() => toggleNotification('tradeAlerts')}
                                trackColor={{ false: "#22314A", true: "#3B82F6" }}
                                thumbColor="#ffffff"
                            />
                        </View>
                        <View style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuText}>Price Alerts</Text>
                                <Text style={styles.menuDescription}>Get notified about price movements</Text>
                            </View>
                            <Switch
                                value={notifications.priceAlerts}
                                onValueChange={() => toggleNotification('priceAlerts')}
                                trackColor={{ false: "#22314A", true: "#3B82F6" }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Security Notifications */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Security</Text>
                        <View style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuText}>Security Alerts</Text>
                                <Text style={styles.menuDescription}>Get notified about security events</Text>
                            </View>
                            <Switch
                                value={notifications.securityAlerts}
                                onValueChange={() => toggleNotification('securityAlerts')}
                                trackColor={{ false: "#22314A", true: "#3B82F6" }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Marketing Notifications */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Marketing</Text>
                        <View style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuText}>News Updates</Text>
                                <Text style={styles.menuDescription}>Receive news and updates</Text>
                            </View>
                            <Switch
                                value={notifications.newsUpdates}
                                onValueChange={() => toggleNotification('newsUpdates')}
                                trackColor={{ false: "#22314A", true: "#3B82F6" }}
                                thumbColor="#ffffff"
                            />
                        </View>
                        <View style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuText}>Marketing Emails</Text>
                                <Text style={styles.menuDescription}>Receive marketing communications</Text>
                            </View>
                            <Switch
                                value={notifications.marketingEmails}
                                onValueChange={() => toggleNotification('marketingEmails')}
                                trackColor={{ false: "#22314A", true: "#3B82F6" }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>
                    {/* Example notifications with modals */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Example notifications:</Text>

                        {/* Simple Notification Button */}
                        <TouchableOpacity style={styles.button} onPress={() => setShowNotification(true)}>
                            <Text style={styles.menuText}>Show Notification</Text>
                        </TouchableOpacity>

                        {/* Cooldown Warning Button */}
                        <TouchableOpacity style={styles.button} onPress={() => setShowCooldownWarning(true)}>
                            <Text style={styles.menuText}>Show Cooldown Warning</Text>
                        </TouchableOpacity>

                        {/* Cooldown with Prompt Button */}
                        <TouchableOpacity style={styles.button} onPress={() => setShowCooldownPrompt(true)}>
                            <Text style={styles.menuText}>Show Cooldown with Prompt</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0D1B2A",
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#748CAB",
        marginBottom: 12,
        textTransform: "uppercase",
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuContent: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        color: "white",
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 14,
        color: "#748CAB",
    },
    button: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
});