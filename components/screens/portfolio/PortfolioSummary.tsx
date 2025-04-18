import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DollarSign, BarChart2, Percent } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

interface PortfolioSummaryProps {
    netValue: string;
    usdtEquity: string;
    combinedValue: string;
    avgLeverage: string;
}

export function PortfolioSummary({ netValue, usdtEquity, combinedValue, avgLeverage }: PortfolioSummaryProps) {
    const { colors } = useTheme();
    
    return (
        <ThemedView variant="card" style={styles.valueCard} border rounded="large" padding="large">
            <View style={styles.valueHeader}>
                <ThemedText variant="label" secondary mb={8}>Total Value</ThemedText>
                <ThemedText variant="heading1" style={styles.valueAmount}>{netValue}</ThemedText>
            </View>
            <View style={styles.valueStats}>
                <StatBox icon={DollarSign} value={usdtEquity} label="USDT Equity" />
                <StatBox icon={BarChart2} value={combinedValue} label="Combined Value" />
                <StatBox icon={Percent} value={`${avgLeverage}x`} label="Avg Leverage" />
            </View>
        </ThemedView>
    );
}

interface StatBoxProps {
    icon: React.ElementType;
    value: string;
    label: string;
}

function StatBox({ icon: Icon, value, label }: StatBoxProps) {
    const { colors } = useTheme();
    
    return (
        <ThemedView variant="section" style={styles.statBox} rounded="medium">
            <Icon size={20} color={colors.textSecondary} />
            <ThemedText variant="bodyBold" mt={8} mb={4}>{value}</ThemedText>
            <ThemedText variant="caption" secondary>{label}</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    valueCard: {
        marginBottom: 24,
    },
    valueHeader: {
        marginBottom: 20,
    },
    valueAmount: {
        fontSize: 36,
        fontWeight: "bold",
    },
    valueStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        marginHorizontal: 4,
    },
}); 