import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Position } from '@/services/api/events';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Check } from 'lucide-react-native';
import { formatCurrency, formatNumber } from '@/utils/formatNumber';

interface PositionCardProps {
    position: Position;
    onPress?: () => void;
    isClosed?: boolean;
}

export function PositionCard({ position, onPress, isClosed = false }: PositionCardProps) {
    const { colors } = useTheme();
    
    const isLong = position.side.toLowerCase() === "long" || position.side.toLowerCase() === "buy";
    
    // For closed positions, use cumRealizedPnl if available
    const pnl = isClosed && (position as any).cumRealizedPnl !== undefined 
        ? (position as any).cumRealizedPnl 
        : position.unrealizedPnl;
    
    const isProfit = pnl >= 0;

    const pnlPercentage = useMemo(() => {
        if (position.entryPrice && position.markPrice && position.entryPrice > 0) {
            const percentChange = ((position.markPrice - position.entryPrice) / position.entryPrice) * 100;
            return isLong ? percentChange : -percentChange;
        }
        return 0;
    }, [position.entryPrice, position.markPrice, isLong]);

    const getPriceDiffColor = () => {
        if (position.markPrice > position.entryPrice) {
            return isLong ? colors.success : colors.error;
        } else if (position.markPrice < position.entryPrice) {
            return isLong ? colors.error : colors.success;
        }
        return colors.text;
    };
    
    // Format quantity for display
    const formattedQty = formatNumber(position.qty, position.qty < 1 ? 4 : 2);
    
    return (
        <ThemedView 
            variant="card" 
            style={styles.card} 
            border 
            rounded="medium"
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardTouchable}>
                {/* Top section: Symbol, side, venue */}
                <View style={styles.topSection}>
                    <View style={styles.symbolRow}>
                        <ThemedText variant="bodyBold" style={styles.symbol}>
                            {formattedQty} {position.symbol}
                        </ThemedText>
                        
                        <ThemedText variant="caption" secondary style={styles.venueText}>
                            {position.venue.toUpperCase()}
                        </ThemedText>
                        
                        <View style={{
                            ...styles.badgeContainer,
                            backgroundColor: isLong ? `${colors.success}15` : `${colors.error}15`,
                        }}>
                            {isLong ? (
                                <ArrowUpRight size={12} color={colors.success} />
                            ) : (
                                <ArrowDownRight size={12} color={colors.error} />
                            )}
                            <ThemedText 
                                variant="caption" 
                                color={isLong ? colors.success : colors.error}
                                style={styles.badgeText}
                            >
                                {position.side.toUpperCase()}
                            </ThemedText>
                        </View>
                        
                        {isClosed && (
                            <View style={{
                                ...styles.statusBadge,
                                backgroundColor: `${colors.success}15`,
                            }}>
                                <Check size={12} color={colors.success} />
                                <ThemedText 
                                    variant="caption" 
                                    color={colors.success}
                                    style={styles.badgeText}
                                >
                                    CLOSED
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    {/* Main row: Amount & PnL */}
                    <View style={styles.mainRow}>
                        <View style={styles.amountAndPricesContainer}>
                            <ThemedText variant="bodyBold" style={styles.amountValue}>
                                {formatCurrency(position.usdtAmt)}
                            </ThemedText>
                            
                            <View style={styles.priceContainer}>
                                <View style={styles.priceValue}>
                                    <ThemedText variant="caption" secondary style={styles.priceLabel}>
                                        Entry
                                    </ThemedText>
                                    <ThemedText variant="caption" style={styles.priceAmount}>
                                        {formatNumber(position.entryPrice, 2)}
                                    </ThemedText>
                                </View>
                                
                                <View style={styles.priceSeparator}>
                                    <ThemedText 
                                        variant="caption"
                                        color={getPriceDiffColor()}
                                    >
                                        →
                                    </ThemedText>
                                </View>
                                
                                <View style={styles.priceValue}>
                                    <ThemedText variant="caption" secondary style={styles.priceLabel}>
                                        {isClosed ? "Close" : "Mark"}
                                    </ThemedText>
                                    <ThemedText 
                                        variant="caption" 
                                        style={styles.priceAmount}
                                        color={getPriceDiffColor()}
                                    >
                                        {formatNumber(position.markPrice, 2)}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.pnlContainer}>
                            <ThemedText 
                                variant="bodyBold" 
                                color={isProfit ? colors.success : colors.error}
                            >
                                {isProfit ? '+' : ''}{formatCurrency(pnl)}
                            </ThemedText>
                            
                            <View style={styles.percentageContainer}>
                                {isProfit ? (
                                    <TrendingUp size={10} color={colors.success} />
                                ) : (
                                    <TrendingDown size={10} color={colors.error} />
                                )}
                                <ThemedText 
                                    variant="caption" 
                                    color={pnlPercentage >= 0 ? colors.success : colors.error}
                                    ml={4}
                                >
                                    {pnlPercentage >= 0 ? '+' : ''}{formatNumber(pnlPercentage, 2)}%
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {isClosed && (
                    <ThemedText variant="caption" secondary style={styles.timestamp}>
                        {new Date(position.timestamp).toLocaleDateString()}
                    </ThemedText>
                )}
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 8,
    },
    cardTouchable: {
        padding: 12,
    },
    topSection: {
        marginBottom: 4,
    },
    symbolRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 6,
        gap: 6,
    },
    symbol: {
        fontSize: 16,
        fontWeight: '600',
    },
    venueText: {
        fontSize: 12,
        fontWeight: '500',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeText: {
        marginLeft: 4,
        fontSize: 10,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    amountAndPricesContainer: {
        flex: 1,
    },
    amountValue: {
        fontSize: 16,
        marginBottom: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 11,
        marginRight: 4,
    },
    priceAmount: {
        fontSize: 11,
    },
    priceSeparator: {
        marginHorizontal: 4,
    },
    pnlContainer: {
        alignItems: 'flex-end',
    },
    percentageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    timestamp: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 4,
        opacity: 0.7,
    },
}); 