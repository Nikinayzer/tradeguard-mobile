import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, Pause, Plus } from "lucide-react-native";

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

const jobs: Job[] = [
    {
        id: "100",
        strategy: "dca",
        side: "buy",
        currentStep: 1,
        totalSteps: 10,
        status: "running",
        progress: 10.0,
        coins: ["XRP", "XLM", "HBAR"]
    },
    {
        id: "101",
        strategy: "grid",
        side: "sell",
        currentStep: 3,
        totalSteps: 5,
        status: "paused",
        progress: 60.0,
        coins: ["BTC", "ETH"]
    }
];

export default function JobsScreen({ navigation }: any) {
    const renderJobItem = ({ item }: { item: Job }) => (
        <TouchableOpacity 
            style={styles.jobRow}
            onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
        >
            <View style={styles.jobId}>
                <Text style={styles.jobIdText}>#{item.id}</Text>
            </View>
            <View style={styles.jobStrategy}>
                <Text style={styles.jobStrategyText}>{item.strategy}</Text>
            </View>
            <View style={styles.jobSide}>
                <Text style={[
                    styles.jobSideText,
                    item.side === "buy" ? styles.buyText : styles.sellText
                ]}>
                    {item.side}
                </Text>
            </View>
            <View style={styles.jobSteps}>
                <Text style={styles.jobStepsText}>
                    {item.currentStep}/{item.totalSteps}
                </Text>
            </View>
            <View style={styles.jobStatus}>
                {item.status === "running" ? (
                    <Play size={16} color="#22C55E" />
                ) : (
                    <Pause size={16} color="#EF4444" />
                )}
            </View>
            <View style={styles.jobProgress}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress.toFixed(1)}%</Text>
            </View>
            <View style={styles.jobCoins}>
                {item.coins.map((coin, index) => (
                    <View key={index} style={styles.coinBadge}>
                        <Text style={styles.coinText}>{coin}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

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
                    <Text style={styles.headerTitle}>All Jobs</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={styles.headerCell}>ID#</Text>
                    <Text style={styles.headerCell}>Sty</Text>
                    <Text style={styles.headerCell}>Side</Text>
                    <Text style={styles.headerCell}>Steps</Text>
                    <Text style={styles.headerCell}>Status</Text>
                    <Text style={styles.headerCell}>Progress</Text>
                    <Text style={styles.headerCell}>Coins</Text>
                </View>

                {/* Jobs List */}
                <FlatList
                    data={jobs}
                    renderItem={renderJobItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.jobsList}
                />
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
    },
    tableHeader: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#22314A",
        borderRadius: 8,
        marginBottom: 8,
    },
    headerCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: "600",
        color: "#748CAB",
        textAlign: "center",
    },
    jobsList: {
        gap: 4,
    },
    jobRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#1B263B",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    jobId: {
        flex: 1,
        alignItems: "center",
    },
    jobIdText: {
        fontSize: 14,
        fontWeight: "600",
        color: "white",
    },
    jobStrategy: {
        flex: 1,
        alignItems: "center",
    },
    jobStrategyText: {
        fontSize: 14,
        color: "#748CAB",
    },
    jobSide: {
        flex: 1,
        alignItems: "center",
    },
    jobSideText: {
        fontSize: 14,
        fontWeight: "500",
    },
    buyText: {
        color: "#22C55E",
    },
    sellText: {
        color: "#EF4444",
    },
    jobSteps: {
        flex: 1,
        alignItems: "center",
    },
    jobStepsText: {
        fontSize: 14,
        color: "#748CAB",
    },
    jobStatus: {
        flex: 1,
        alignItems: "center",
    },
    jobProgress: {
        flex: 2,
        alignItems: "center",
        gap: 4,
    },
    progressBar: {
        width: "100%",
        height: 4,
        backgroundColor: "#22314A",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: "#748CAB",
    },
    jobCoins: {
        flex: 2,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        justifyContent: "center",
    },
    coinBadge: {
        backgroundColor: "#22314A",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    coinText: {
        fontSize: 12,
        color: "#748CAB",
    },
});
