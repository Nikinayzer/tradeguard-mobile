import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/navigation/navigation";

type SecurityScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SecuritySettingsScreen() {
    const navigation = useNavigation<SecurityScreenNavigationProp>();

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
                    <Text style={styles.title}>Security</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Password Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Password</Text>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>Change Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>Two-Factor Authentication</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Device Management */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Device Management</Text>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>Connected Devices</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>Login History</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Security Preferences */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Security Preferences</Text>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>Email Notifications</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>SMS Notifications</Text>
                        </TouchableOpacity>
                    </View>
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
    menuText: {
        fontSize: 16,
        color: "white",
    },
}); 