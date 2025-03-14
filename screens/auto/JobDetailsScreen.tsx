import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, Pause, Trash2, Settings } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "JobDetails">;

interface Job {
    id: string;
    strategy: string;
    side: "buy" | "sell";
    currentStep: number;
    totalSteps: number;
    status: "running" | "paused";
    progress: number;
    coins: string[];
}

// Mock data
const getJobDetails = (jobId: string): Job => ({
    id: jobId,
    strategy: "dca",
    side: "buy",
    currentStep: 1,
    totalSteps: 10,
    status: "running",
    progress: 10.0,
    coins: ["XRP", "XLM", "HBAR"]
});

export default function JobDetailsScreen({ route, navigation }: Props) {
    const { jobId } = route.params;
    const job = getJobDetails(jobId);

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
                    <Text style={styles.headerTitle}>Job #{jobId}</Text>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Settings size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {/* Status Card */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <View style={styles.statusIndicator}>
                                {job.status === "running" ? (
                                    <Play size={20} color="#22C55E" />
                                ) : (
                                    <Pause size={20} color="#EF4444" />
                                )}
                            </View>
                            <Text style={styles.statusText}>
                                {job.status === "running" ? "Running" : "Paused"}
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${job.progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            Progress: {job.progress.toFixed(1)}%
                        </Text>
                    </View>

                    {/* Details Card */}
                    <View style={styles.detailsCard}>
                        <Text style={styles.cardTitle}>Job Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Strategy</Text>
                            <Text style={styles.detailValue}>{job.strategy.toUpperCase()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Side</Text>
                            <Text style={[
                                styles.detailValue,
                                job.side === "buy" ? styles.buyText : styles.sellText
                            ]}>
                                {job.side.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Steps</Text>
                            <Text style={styles.detailValue}>
                                {job.currentStep} / {job.totalSteps}
                            </Text>
                        </View>
                    </View>

                    {/* Coins Card */}
                    <View style={styles.coinsCard}>
                        <Text style={styles.cardTitle}>Trading Pairs</Text>
                        <View style={styles.coinsList}>
                            {job.coins.map((coin, index) => (
                                <View key={index} style={styles.coinBadge}>
                                    <Text style={styles.coinText}>{coin}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Play size={20} color="white" />
                            <Text style={styles.actionText}>Resume</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                            <Trash2 size={20} color="white" />
                            <Text style={styles.actionText}>Delete</Text>
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
        justifyContent: "space-between",
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
    },
    statusCard: {
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    statusHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    statusIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    statusText: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
    },
    progressBar: {
        height: 4,
        backgroundColor: "#22314A",
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 2,
    },
    progressText: {
        fontSize: 14,
        color: "#748CAB",
    },
    detailsCard: {
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: "#748CAB",
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "white",
    },
    buyText: {
        color: "#22C55E",
    },
    sellText: {
        color: "#EF4444",
    },
    coinsCard: {
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    coinsList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    coinBadge: {
        backgroundColor: "#22314A",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    coinText: {
        fontSize: 14,
        color: "#748CAB",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#3B82F6",
        padding: 16,
        borderRadius: 12,
    },
    deleteButton: {
        backgroundColor: "#EF4444",
    },
    actionText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
}); 