import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {DirectionBadge} from './DirectionBadge';

export interface OpenPosition {
    id: string;
    symbol: string;
    direction: "long" | "short";
    amount: string;
    entry: string;
    mark: string;
    bust: string;
    upl: string;
    cumPL: string;
    change24h: string;
    lev: string;
    vol: string;
    fund: string;
    tp: string | null;
    sl: string | null;
}

interface PositionCardProps {
    position: OpenPosition;
    onPress?: () => void;
}

export function PositionCard({position, onPress}: PositionCardProps) {
    const isLong = position.direction === "long";
    const isProfit = !position.upl.includes("-");

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.symbolContainer}>
                    <Text style={styles.symbol}>{position.symbol}</Text>
                    <DirectionBadge isLong={isLong}/>
                </View>
                <View style={styles.valueContainer}>
                    <Text style={[styles.value, isProfit ? styles.profit : styles.loss]}>
                        {position.upl} USDT
                    </Text>
                    <Text style={styles.change}>{position.change24h}</Text>
                </View>
            </View>

            <DetailsRow
                items={[
                    {label: "Amount", value: `${position.amount} USDT`},
                    {label: "Entry", value: position.entry},
                    {label: "Mark", value: position.mark},
                    {label: "Bust", value: position.bust},
                ]}
            />

            <DetailsRow
                items={[
                    {label: "Cum P/L", value: position.cumPL},
                    {label: "Lev", value: `${position.lev}x`},
                    {label: "Vol", value: position.vol},
                    {label: "Fund%", value: position.fund},
                ]}
            />

            {(position.tp || position.sl) && (
                <View style={styles.tpslContainer}>
                    {position.tp && (
                        <TPSLBox
                            type="tp"
                            value={position.tp}
                            entryPrice={parseFloat(position.entry)}
                        />
                    )}
                    {position.sl && (
                        <TPSLBox
                            type="sl"
                            value={position.sl}
                            entryPrice={parseFloat(position.entry)}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

interface DetailItem {
    label: string;
    value: string;
}

function DetailsRow({items}: { items: DetailItem[] }) {
    return (
        <View style={styles.detailsRow}>
            {items.map((item, index) => (
                <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{item.value}</Text>
                </View>
            ))}
        </View>
    );
}

interface TPSLBoxProps {
    type: "tp" | "sl";
    value: string;
    entryPrice: number;
}

function TPSLBox({type, value, entryPrice}: TPSLBoxProps) {
    const percentage = ((parseFloat(value) - entryPrice) / entryPrice * 100).toFixed(2);
    const isTP = type === "tp";

    return (
        <View style={[styles.tpslBox, isTP ? styles.tpBox : styles.slBox]}>
            <Text style={styles.tpslLabel}>{type.toUpperCase()}</Text>
            <Text style={styles.tpslValue}>{value}</Text>
            <Text style={styles.tpslPercentage}>{percentage}%</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1B263B",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        height: 28,
    },
    symbolContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    symbol: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
    },
    valueContainer: {
        alignItems: "flex-end",
    },
    value: {
        fontSize: 16,
        fontWeight: "700",
    },
    change: {
        fontSize: 12,
        color: "#748CAB",
    },
    profit: {
        color: "#22C55E",
    },
    loss: {
        color: "#EF4444",
    },
    badge: {
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
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 2,
    },
    longText: {
        color: "#22C55E",
    },
    shortText: {
        color: "#EF4444",
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        backgroundColor: "#22314A",
        padding: 6,
        borderRadius: 6,
    },
    detailItem: {
        flex: 1,
        alignItems: "center",
    },
    detailLabel: {
        fontSize: 10,
        color: "#748CAB",
        marginBottom: 2,
        fontWeight: "500",
    },
    detailValue: {
        fontSize: 12,
        color: "white",
        fontWeight: "500",
    },
    tpslContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 6,
        marginTop: 4,
    },
    tpslBox: {
        flex: 1,
        padding: 6,
        borderRadius: 6,
        alignItems: "center",
    },
    tpBox: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(34, 197, 94, 0.3)",
    },
    slBox: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.3)",
    },
    tpslLabel: {
        fontSize: 10,
        color: "#748CAB",
        marginBottom: 2,
        fontWeight: "500",
    },
    tpslValue: {
        fontSize: 12,
        color: "white",
        fontWeight: "600",
        marginBottom: 1,
    },
    tpslPercentage: {
        fontSize: 10,
        color: "#748CAB",
        fontWeight: "500",
    },
}); 