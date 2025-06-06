import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Position } from '@/types/events';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Check } from 'lucide-react-native';
import { formatCurrency, formatNumber } from '@/utils/formatNumber';
import { CryptoIcon } from '@/components/common/CryptoIcon';

interface PositionCardProps {
    position: Position;
    onPress?: () => void;
    isClosed?: boolean;
}

export function PositionCard({ position, onPress, isClosed = false }: PositionCardProps) {
    const { colors } = useTheme();

    if (!position || !position.side) {
        console.warn('Invalid position data:', position);
        return null;
    }
    
    const isLong = position.side.toLowerCase() === "long" || position.side.toLowerCase() === "buy";

    const pnl = isClosed && position.pnl.cumulative !== null 
        ? position.pnl.cumulative 
        : position.pnl.unrealized;
    
    const isProfit = pnl >= 0;

    const pnlPercentage = useMemo(() => {
        const entryValue = position.size?.value;
        const unrealizedPnl = isClosed
            ? position.pnl.cumulative
            : position.pnl.unrealized;

        if (entryValue && entryValue !== 0) {
            return (unrealizedPnl / entryValue) * 100;
        }

        return 0;
    }, [position.size?.value, position.pnl.unrealized, position.pnl.cumulative, isClosed]);

    const getPriceDiffColor = () => {
        if (position.prices.mark > position.prices.entry) {
            return isLong ? colors.success : colors.error;
        } else if (position.prices.mark < position.prices.entry) {
            return isLong ? colors.error : colors.success;
        }
        return colors.text;
    };

    const formattedQty = formatNumber(Math.abs(position.size.quantity), position.size.quantity < 1 ? 4 : 2);
    
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
                        <View style={styles.symbolContainer}>
                            <CryptoIcon symbol={position.symbol} size={20} style={styles.cryptoIcon} />
                            <ThemedText variant="bodyBold" style={styles.symbol}>
                                {position.symbol}
                            </ThemedText>
                        </View>
                        
                        <ThemedText variant="caption" secondary style={styles.venueText}>
                            {position.venue?.toUpperCase() || 'UNKNOWN'}
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
                            <View style={styles.amountAndPnlContainer}>
                                <ThemedText variant="body" style={styles.quantityText}>
                                    {formattedQty}
                                </ThemedText>
                                <ThemedText variant="body" style={styles.separator}>~</ThemedText>
                                <ThemedText variant="bodyBold" style={styles.amountValue}>
                                    {formatCurrency(Math.abs(position.size.value))}
                                </ThemedText>
                                <ThemedText 
                                    variant="body" 
                                    color={pnl >= 0 ? colors.success : colors.error}
                                    style={styles.pnlText}
                                >
                                    {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                                </ThemedText>
                            </View>
                            
                            <View style={styles.priceContainer}>
                                <View style={styles.priceValue}>
                                    <ThemedText variant="caption" secondary style={styles.priceLabel}>
                                        Entry
                                    </ThemedText>
                                    <ThemedText variant="caption" style={styles.priceAmount}>
                                        {formatNumber(position.prices.entry, 2)}
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
                                        {formatNumber(position.prices.mark, 2)}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.percentageContainer}>
                            <ThemedText 
                                variant="caption" 
                                color={pnlPercentage >= 0 ? colors.success : colors.error}
                            >
                                {pnlPercentage >= 0 ? '+' : ''}{formatNumber(pnlPercentage, 2)}%
                            </ThemedText>
                        </View>
                    </View>
                </View>
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
    symbolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cryptoIcon: {
        marginRight: 2,
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
    amountAndPnlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '500',
    },
    separator: {
        fontSize: 14,
        marginHorizontal: 2,
        opacity: 0.5,
    },
    amountValue: {
        fontSize: 16,
    },
    pnlText: {
        fontSize: 14,
        fontWeight: '500',
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
    percentageContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingTop: 4,
    },
}); 