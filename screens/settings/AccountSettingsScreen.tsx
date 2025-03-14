import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/navigation/navigation";

type AccountSettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function AccountSettingsScreen() {
    const navigation = useNavigation<AccountSettingsScreenNavigationProp>();

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
                    <Text style={styles.title}>Account Settings</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Profile Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Profile Information</Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>John Doe</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>john.doe@example.com</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>+1 234 567 8900</Text>
                        </View>
                    </View>

                    {/* Account Preferences */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Preferences</Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Language</Text>
                            <Text style={styles.infoValue}>English</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Time Zone</Text>
                            <Text style={styles.infoValue}>UTC-5</Text>
                        </View>
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
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 16,
        color: "#748CAB",
    },
    infoValue: {
        fontSize: 16,
        color: "white",
        fontWeight: "500",
    },
}); 