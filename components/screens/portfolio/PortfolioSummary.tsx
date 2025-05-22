import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VenueEquity } from '@/types/events';
import { formatCurrency } from '@/utils/formatNumber';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { TrendingUp, TrendingDown, Wallet, Coins } from 'lucide-react-native';
import { usePositions } from '@/services/redux/hooks';

interface PortfolioSummaryProps {
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalBnbBalance: number;
  venueEquities: VenueEquity[];
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalWalletBalance,
  totalAvailableBalance,
  totalBnbBalance,
  venueEquities,
}) => {
  const { colors } = useTheme();
  const { totalUnrealizedPnl } = usePositions();
  const isPnlPositive = totalUnrealizedPnl >= 0;

  return (
    <ThemedView variant="card" style={styles.container} border rounded="large">
      {/* Total Value Section */}
      <View style={styles.totalValueContainer}>
        <ThemedText variant="label" secondary style={styles.totalValueLabel}>
          Total Portfolio Value
        </ThemedText>
        <ThemedText variant="heading1" style={styles.totalValue}>
          {formatCurrency(totalWalletBalance)}
        </ThemedText>
        <ThemedView 
          style={{
            ...styles.pnlBadge,
            backgroundColor: isPnlPositive ? `${colors.success}15` : `${colors.error}15`
          }}
          rounded="medium"
        >
          {isPnlPositive ? (
            <TrendingUp size={16} color={colors.success} />
          ) : (
            <TrendingDown size={16} color={colors.error} />
          )}
          <ThemedText 
            variant="caption" 
            color={isPnlPositive ? colors.success : colors.error}
            style={styles.pnlText}
          >
            {formatCurrency(totalUnrealizedPnl)} PnL
          </ThemedText>
        </ThemedView>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Wallet size={16} color={colors.textSecondary} />
          <ThemedText variant="caption" secondary style={styles.statLabel}>
            Available Balance
          </ThemedText>
          <ThemedText variant="bodyBold">
            {formatCurrency(totalAvailableBalance)}
          </ThemedText>
        </View>
        {totalBnbBalance > 0 && (
          <View style={styles.statItem}>
            <Coins size={16} color={colors.textSecondary} />
            <ThemedText variant="caption" secondary style={styles.statLabel}>
              BNB Balance
            </ThemedText>
            <ThemedText variant="bodyBold">
              {formatCurrency(totalBnbBalance)}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Exchange Balances */}
      {venueEquities.length > 0 && (
        <View style={styles.venueEquitiesContainer}>
          <ThemedText variant="label" secondary style={styles.venueEquitiesTitle}>
            Exchange Balances
          </ThemedText>
          {venueEquities.map((venue, index) => (
            <View 
              key={venue.venue} 
              style={[
                styles.venueEquityItem,
                index === venueEquities.length - 1 ? styles.lastVenueItem : null
              ]}
            >
              <ThemedText variant="body" style={styles.venueName}>
                {venue.venue.toUpperCase()}
              </ThemedText>
              <View style={styles.venueEquityDetails}>
                <ThemedText variant="bodyBold">
                  {formatCurrency(venue.balances.wallet)}
                </ThemedText>
                {venue.totalUnrealizedPnl !== 0 && (
                  <ThemedText 
                    variant="caption" 
                    color={venue.totalUnrealizedPnl >= 0 ? colors.success : colors.error}
                    style={styles.venuePnl}
                  >
                    {venue.totalUnrealizedPnl >= 0 ? '+' : ''}
                    {formatCurrency(venue.totalUnrealizedPnl)}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  totalValueContainer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
  },
  totalValueLabel: {
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: 'bold',
    lineHeight: 50,
    includeFontPadding: false,
    marginBottom: 12,
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pnlText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    marginTop: 4,
    marginBottom: 2,
  },
  venueEquitiesContainer: {
    paddingTop: 16,
  },
  venueEquitiesTitle: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  venueEquityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  lastVenueItem: {
    borderBottomWidth: 0,
  },
  venueName: {
    fontWeight: '500',
  },
  venueEquityDetails: {
    alignItems: 'flex-end',
  },
  venuePnl: {
    marginTop: 2,
  },
}); 