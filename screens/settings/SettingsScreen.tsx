import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Bell, ChevronLeft, HelpCircle, History, Lock, Shield, Wallet, User} from "lucide-react-native";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {SettingsStackParamList} from "@/navigation/navigation";
import {useAuth} from "@/contexts/AuthContext";
import {Ionicons} from "@expo/vector-icons";
import {authService} from "@/services/api/auth";
import {usePushToken} from "@/contexts/PushTokenContext";

type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsScreen() {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const {pushToken} = usePushToken();
    const {logout} = useAuth();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            await authService.logout(pushToken);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to logout');
                            console.log(error.toString())
                        }
                    },
                },
            ]
        );
    };

    const menuItems = [
        {
            id: 'personal',
            title: 'Personal Information',
            description: 'Update your profile details and contact information',
            icon: <User size={24} color="#748CAB"/>,
            onPress: () => navigation.navigate('PersonalInfo'),
        },
        {
            id: 'limits',
            title: 'Account Limits',
            description: 'Set up trade limits to prevent gambling patterns',
            icon: <Lock size={24} color="#748CAB"/>,
            onPress: () => navigation.navigate('AccountLimits'),
        },
        {
            id: 'security',
            title: 'Security',
            description: 'Manage your account security settings',
            icon: <Shield size={24} color="#748CAB"/>,
            onPress: () => navigation.navigate('Security'),
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Configure your notification preferences',
            icon: <Bell size={24} color="#748CAB"/>,
            onPress: () => navigation.navigate('Notifications'),
        },
        {
            id: 'wallet',
            title: 'Wallet',
            description: 'Manage your wallet and payment methods',
            icon: <Wallet size={24} color="#748CAB"/>,
            onPress: () => {
            },
        },
        {
            id: 'history',
            title: 'Trading History',
            description: 'View your past trades and transactions',
            icon: <History size={24} color="#748CAB"/>,
            onPress: () => {
            },
        },
        {
            id: 'help',
            title: 'Help & Support',
            description: 'Get help and contact support',
            icon: <HelpCircle size={24} color="#748CAB"/>,
            onPress: () => {
            },
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color="#3B82F6"/>
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={item.onPress}
                            >
                                <View style={styles.menuIcon}>
                                    {item.icon}
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuDescription}>{item.description}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#EF4444"/>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
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
    profileSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        color: "white",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: "#748CAB",
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: "#1B263B",
        borderRadius: 12,
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#748CAB',
    },
    menuContainer: {
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B263B',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 12,
        color: '#748CAB',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1B263B',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
}); 