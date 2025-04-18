import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {DirectionBadge} from './DirectionBadge';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedView} from '@/components/ui/ThemedView';

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
    const {colors} = useTheme();
    const isLong = position.direction === "long";
    const isProfit = !position.upl.includes("-");

    return (
        <ThemedView variant="card" style={styles.card} border rounded="medium">
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardTouchable}>
                <View style={styles.header}>
                    <View style={styles.symbolContainer}>
                        <ThemedText variant="bodyBold" style={styles.symbol}>{position.symbol}</ThemedText>
                        <DirectionBadge isLong={isLong}/>
                    </View>
                    <View style={styles.valueContainer}>
                        <ThemedText 
                            variant="bodyBold" 
                            color={isProfit ? colors.success : colors.error}
                        >
                            {position.upl} USDT
                        </ThemedText>
                        <ThemedText variant="caption" secondary>{position.change24h}</ThemedText>
                    </View>
                </View>

                <ThemedView variant="section" style={styles.detailsContainer} rounded="small">
                    <DetailsRow
                        items={[
                            {label: "Amount", value: `${position.amount} USDT`},
                            {label: "Entry", value: position.entry},
                            {label: "Mark", value: position.mark},
                            {label: "Bust", value: position.bust},
                        ]}
                    />
                </ThemedView>

                <ThemedView variant="section" style={styles.detailsContainer} rounded="small">
                    <DetailsRow
                        items={[
                            {label: "Cum P/L", value: position.cumPL},
                            {label: "Lev", value: `${position.lev}x`},
                            {label: "Vol", value: position.vol},
                            {label: "Fund%", value: position.fund},
                        ]}
                    />
                </ThemedView>

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
        </ThemedView>
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
                    <ThemedText variant="caption" secondary style={styles.detailLabel}>{item.label}</ThemedText>
                    <ThemedText variant="bodySmall">{item.value}</ThemedText>
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
    const {colors} = useTheme();
    const percentage = ((parseFloat(value) - entryPrice) / entryPrice * 100).toFixed(2);
    const isTP = type === "tp";
    const bgColor = isTP ? `${colors.success}15` : `${colors.error}15`;
    const textColor = isTP ? colors.success : colors.error;

    return (
        <View style={[styles.tpslBox, {backgroundColor: bgColor}]}>
            <ThemedText variant="caption" color={textColor}>{type.toUpperCase()}</ThemedText>
            <ThemedText variant="bodySmall" color={textColor}>{value}</ThemedText>
            <ThemedText variant="caption" color={textColor}>{percentage}%</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
    },
    cardTouchable: {
        padding: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        height: 28,
    },
    symbolContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    symbol: {
        fontSize: 16,
    },
    valueContainer: {
        alignItems: "flex-end",
    },
    detailsContainer: {
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 6,
    },
    detailItem: {
        flex: 1,
        alignItems: "center",
    },
    detailLabel: {
        marginBottom: 4,
    },
    tpslContainer: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    tpslBox: {
        flex: 1,
        borderRadius: 6,
        padding: 8,
        alignItems: "center",
    },
}); 