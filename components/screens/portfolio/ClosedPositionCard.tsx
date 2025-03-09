import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

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
    return (
        <TouchableOpacity style={styles.closedPositionCard}>
            <View style={styles.closedPositionHeader}>
                <View style={styles.closedPositionSymbol}>
                    <Text style={styles.symbolText}>{position.symbol}</Text>
                    <View style={[
                        styles.directionBadge,
                        position.direction === "long" ? styles.longBadge : styles.shortBadge
                    ]}>
                        {position.direction === "long" ? (
                            <ArrowUpRight size={12} color="#22C55E" />
                        ) : (
                            <ArrowDownRight size={12} color="#EF4444" />
                        )}
                        <Text style={[
                            styles.directionText,
                            position.direction === "long" ? styles.greenText : styles.redText
                        ]}>
                            {position.direction.toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Text style={[
                    styles.closedPositionPnl,
                    position.pnl.includes("-") ? styles.redText : styles.greenText
                ]}>
                    {position.pnl} USDT
                </Text>
            </View>
            <View style={styles.closedPositionDetails}>
                <View style={styles.closedDetailItem}>
                    <Text style={styles.closedDetailLabel}>Entry</Text>
                    <Text style={styles.closedDetailValue}>{position.entry}</Text>
                </View>
                <View style={styles.closedDetailItem}>
                    <Text style={styles.closedDetailLabel}>Exit</Text>
                    <Text style={styles.closedDetailValue}>{position.exit}</Text>
                </View>
                <View style={styles.closedDetailItem}>
                    <Text style={styles.closedDetailLabel}>Duration</Text>
                    <Text style={styles.closedDetailValue}>{position.duration}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    closedPositionCard: {
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#22314A",
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
        fontWeight: "700",
    },
    closedPositionDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        backgroundColor: "#22314A",
        padding: 12,
        borderRadius: 8,
    },
    closedDetailItem: {
        flex: 1,
        alignItems: "center",
    },
    closedDetailLabel: {
        fontSize: 12,
        color: "#748CAB",
        marginBottom: 4,
        fontWeight: "500",
    },
    closedDetailValue: {
        fontSize: 14,
        color: "white",
        fontWeight: "500",
    },
    symbolText: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
        lineHeight: 28,
    },
    directionText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 2,
    },
    greenText: {
        color: "#22C55E",
    },
    redText: {
        color: "#EF4444",
    },
    directionBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    longBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
    },
    shortBadge: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    },

});