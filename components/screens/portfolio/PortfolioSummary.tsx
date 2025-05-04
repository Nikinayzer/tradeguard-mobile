import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Wallet, TrendingUp, TrendingDown, CreditCard, ArrowRight, Coins } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { formatCurrency, formatNumber } from '@/utils/formatNumber';
import { VenueEquity } from '@/services/api/events';

interface PortfolioSummaryProps {
    totalWalletBalance: number;
    totalAvailableBalance: number;
    totalUnrealizedPnl: number;
    totalBnbBalanceUsdt: number;
    venueEquities?: VenueEquity[];
}

export function PortfolioSummary({ 
    totalWalletBalance, 
    totalAvailableBalance, 
    totalUnrealizedPnl,
    totalBnbBalanceUsdt,
    venueEquities = []
}: PortfolioSummaryProps) {
    const { colors } = useTheme();
    const isPnlPositive = totalUnrealizedPnl >= 0;
    
    return (
        <ThemedView variant="card" style={styles.valueCard} border rounded="large">
            {/* Total Value Section */}
            <View style={styles.headerSection}>
                <ThemedText variant="label" secondary mb={12}>Total Portfolio Value</ThemedText>
                <View style={styles.valueRow}>
                    <View style={styles.valueContainer}>
                        <ThemedText variant="heading1" style={styles.valueAmount}>
                            {formatCurrency(totalWalletBalance)}
                        </ThemedText>
                    </View>
                    
                    {totalUnrealizedPnl !== 0 && (
                        <ThemedView 
                            style={{
                                ...styles.pnlBadge, 
                                backgroundColor: isPnlPositive ? `${colors.success}15` : `${colors.error}15`
                            }}
                            rounded="medium"
                        >
                            {isPnlPositive ? (
                            <TrendingUp size={16} color={colors.success} />
                            )
                            :
                            (
                            <TrendingDown size={16} color={colors.error} />
                            )}
                            <ThemedText 
                                variant="caption" 
                                color={isPnlPositive ? colors.success : colors.error}
                                ml={4}
                            >
                                {formatCurrency(totalUnrealizedPnl)}
                            </ThemedText>
                        </ThemedView>
                    )}
                </View>
                
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Wallet size={16} color={colors.textSecondary} />
                        <ThemedText variant="caption" secondary style={styles.statLabel}>Available</ThemedText>
                        <ThemedText variant="bodySmall" weight="600">{formatCurrency(totalAvailableBalance)}</ThemedText>
                    </View>
                    
                    {totalBnbBalanceUsdt > 0 && (
                        <View style={styles.statItem}>
                            <Coins size={16} color={colors.textSecondary} />
                            <ThemedText variant="caption" secondary style={styles.statLabel}>BNB</ThemedText>
                            <ThemedText variant="bodySmall" weight="600">{formatCurrency(totalBnbBalanceUsdt)}</ThemedText>
                        </View>
                    )}
            </View>
            </View>
            
            {/* Exchange Balances */}
            {venueEquities.length > 0 && (
                <View style={styles.exchangeSection}>
                    <ThemedText variant="label" secondary style={styles.exchangeTitle}>Exchange Balances</ThemedText>
                    
                    {venueEquities.map((venue, index) => (
                        <View 
                            key={`venue-${venue.venue}-${index}`} 
                            style={[
                                styles.venueRow,
                                index === venueEquities.length - 1 ? styles.lastVenueRow : null
                            ]}
                        >
                            <View style={styles.venueNameContainer}>
                                <ThemedView 
                                    style={styles.venueIcon}
                                    variant="section" 
                                    rounded="full"
                                >
                                    <CreditCard size={14} color={colors.textSecondary} />
        </ThemedView>
                                <ThemedText variant="body">{venue.venue.toUpperCase()}</ThemedText>
                            </View>
                            
                            <View style={styles.balanceContainer}>
                                <ThemedText variant="bodyBold">
                                    {formatCurrency(venue.walletBalance)}
                                </ThemedText>
                                
                                {venue.totalUnrealizedPnl !== 0 && (
                                    <ThemedText 
                                        variant="caption" 
                                        color={venue.totalUnrealizedPnl >= 0 ? colors.success : colors.error}
                                        style={styles.pnlText}
                                    >
                                        {venue.totalUnrealizedPnl >= 0 ? '+' : ''}
                                        {formatCurrency(venue.totalUnrealizedPnl)}
                                    </ThemedText>
                                )}
                                
                                <ArrowRight size={14} color={colors.textTertiary} style={styles.venueArrow} />
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    valueCard: {
        marginBottom: 24,
        overflow: 'hidden',
    },
    headerSection: {
        padding: 20,
        paddingTop: 24,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    valueContainer: {
        minHeight: 50,
        justifyContent: 'center',
    },
    valueAmount: {
        fontSize: 34,
        fontWeight: "bold",
        lineHeight: 50,
        includeFontPadding: false,
    },
    pnlBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignSelf: 'center',
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 12,
    },
    statItem: {
        alignItems: "center",
        flexDirection: "column",
        flex: 1,
        gap: 4,
    },
    statLabel: {
        marginBottom: 2,
    },
    exchangeSection: {
        marginTop: 4,
    },
    exchangeTitle: {
        padding: 16,
        paddingBottom: 12,
    },
    venueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(150, 150, 150, 0.1)',
    },
    lastVenueRow: {
        borderBottomWidth: 0,
    },
    venueNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    venueIcon: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pnlText: {
        marginLeft: 4,
    },
    venueArrow: {
        marginLeft: 12,
    },
}); 