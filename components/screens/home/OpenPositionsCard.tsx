import React from 'react';
import { TrendingUp } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/services/redux/store';
import { useTheme } from '@/contexts/ThemeContext';
import { StatCard } from './StatCard';

export function OpenPositionsCard() {
    const { colors } = useTheme();
    const positions = useSelector((state: RootState) => state.positions);
    const activePositions = positions.activePositionsCount || 0;
    const profitablePositions = positions.activePositions?.filter(pos => pos.pnl.unrealized > 0).length || 0;

    return (
        <StatCard
            icon={TrendingUp}
            title="Open Positions"
            value={activePositions.toString()}
            subtitle={`${profitablePositions} in profit`}
            subtitleColor={colors.success}
        />
    );
} 