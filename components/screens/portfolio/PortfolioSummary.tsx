import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DollarSign, BarChart2, Percent } from 'lucide-react-native';

interface PortfolioSummaryProps {
    netValue: string;
    usdtEquity: string;
    combinedValue: string;
    avgLeverage: string;
}

export function PortfolioSummary({ netValue, usdtEquity, combinedValue, avgLeverage }: PortfolioSummaryProps) {
    return (
        <View style={styles.valueCard}>
            <View style={styles.valueHeader}>
                <Text style={styles.valueLabel}>Total Value</Text>
                <Text style={styles.valueAmount}>{netValue}</Text>
            </View>
            <View style={styles.valueStats}>
                <StatBox icon={DollarSign} value={usdtEquity} label="USDT Equity" />
                <StatBox icon={BarChart2} value={combinedValue} label="Combined Value" />
                <StatBox icon={Percent} value={`${avgLeverage}x`} label="Avg Leverage" />
            </View>
        </View>
    );
}

interface StatBoxProps {
    icon: React.ElementType;
    value: string;
    label: string;
}

function StatBox({ icon: Icon, value, label }: StatBoxProps) {
    return (
        <View style={styles.statBox}>
            <Icon size={20} color="#748CAB" />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    valueCard: {
        backgroundColor: "#1B263B",
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    valueHeader: {
        marginBottom: 20,
    },
    valueLabel: {
        fontSize: 14,
        color: "#748CAB",
        marginBottom: 8,
    },
    valueAmount: {
        fontSize: 36,
        fontWeight: "bold",
        color: "white",
    },
    valueStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#22314A",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#748CAB",
    },
}); 