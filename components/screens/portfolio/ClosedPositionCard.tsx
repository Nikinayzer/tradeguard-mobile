import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export interface ClosedPosition {
    id: string;
    symbol: string;
    direction: "long" | "short";
    amount: string;
    entry: string;
    exit: string;
    pnl: string;
    duration: string;
    date: string;
}

interface ClosedPositionCardProps {
    position: ClosedPosition;
    onPress?: () => void;
}

export function ClosedPositionCard({ position, onPress }: ClosedPositionCardProps) {
    const { colors } = useTheme();
    const isLong = position.direction === "long";
    const isProfit = !position.pnl.includes("-");

    return (
        <ThemedView variant="card" style={styles.closedPositionCard} border rounded="medium">
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardTouchable}>
                <View style={styles.closedPositionHeader}>
                    <View style={styles.closedPositionSymbol}>
                        <ThemedText variant="bodyBold" style={styles.symbolText}>{position.symbol}</ThemedText>
                        <View style={[
                            styles.directionBadge,
                            { backgroundColor: isLong ? `${colors.success}15` : `${colors.error}15` }
                        ]}>
                            {isLong ? (
                                <ArrowUpRight size={12} color={colors.success} />
                            ) : (
                                <ArrowDownRight size={12} color={colors.error} />
                            )}
                            <ThemedText 
                                variant="caption" 
                                color={isLong ? colors.success : colors.error}
                                style={styles.directionText}
                            >
                                {position.direction.toUpperCase()}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText 
                        variant="bodyBold" 
                        color={isProfit ? colors.success : colors.error}
                        style={styles.closedPositionPnl}
                    >
                        {position.pnl} USDT
                    </ThemedText>
                </View>
                <ThemedView variant="section" style={styles.closedPositionDetails} rounded="small">
                    <View style={styles.closedDetailItem}>
                        <ThemedText variant="caption" secondary style={styles.closedDetailLabel}>Entry</ThemedText>
                        <ThemedText variant="body">{position.entry}</ThemedText>
                    </View>
                    <View style={styles.closedDetailItem}>
                        <ThemedText variant="caption" secondary style={styles.closedDetailLabel}>Exit</ThemedText>
                        <ThemedText variant="body">{position.exit}</ThemedText>
                    </View>
                    <View style={styles.closedDetailItem}>
                        <ThemedText variant="caption" secondary style={styles.closedDetailLabel}>Duration</ThemedText>
                        <ThemedText variant="body">{position.duration}</ThemedText>
                    </View>
                </ThemedView>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    closedPositionCard: {
        marginBottom: 12,
    },
    cardTouchable: {
        padding: 16,
    },
    closedPositionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        height: 32,
    },
    closedPositionSymbol: {
        flexDirection: "row",
        alignItems: "center",
        height: 32,
    },
    closedPositionPnl: {
        fontSize: 18,
    },
    closedPositionDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        padding: 12,
    },
    closedDetailItem: {
        flex: 1,
        alignItems: "center",
    },
    closedDetailLabel: {
        marginBottom: 4,
    },
    symbolText: {
        lineHeight: 28,
    },
    directionText: {
        marginLeft: 2,
    },
    directionBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
});