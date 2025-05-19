import React from 'react';
import { DollarSign } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/services/redux/store';
import { formatCurrency } from '@/utils/formatNumber';
import { useTheme } from '@/contexts/ThemeContext';
import { StatCard } from './StatCard';

export function PortfolioValueCard() {
    const { colors } = useTheme();
    const equity = useSelector((state: RootState) => state.equity);
    const totalValue = equity.totalWalletBalance || 0;
    const totalPnl = equity.totalUnrealizedPnl || 0;
    const pnlPercentage = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;
    const isPositive = pnlPercentage >= 0;

    return (
        <StatCard
            icon={DollarSign}
            title="Portfolio Value"
            value={formatCurrency(totalValue)}
            subtitle={`${isPositive ? '+' : ''}${pnlPercentage.toFixed(2)}% PnL`}
            subtitleColor={isPositive ? colors.success : colors.error}
        />
    );
} 