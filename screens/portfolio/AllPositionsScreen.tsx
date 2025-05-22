import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { PositionCard } from '@/components/screens/portfolio/PositionCard';
import { CategorySelector } from '@/components/screens/market/CategorySelector';
import { usePositions } from '@/services/redux/hooks';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Position } from '@/types/events';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PortfolioStackParamList } from '@/navigation/navigation';

const CATEGORIES = ['Active', 'Closed'];
type PositionCategory = 'Active' | 'Closed';

type AllPositionsScreenRouteProp = RouteProp<PortfolioStackParamList, 'AllPositions'>;

export default function AllPositionsScreen() {
    const { colors } = useTheme();
    const route = useRoute<AllPositionsScreenRouteProp>();
    const [selectedCategory, setSelectedCategory] = useState<PositionCategory>(
        route.params.type === 'active' ? 'Active' : 'Closed'
    );
    const positionsData = usePositions();

    const { isRefreshing, handleRefresh } = usePullToRefresh({
        onRefresh: async () => {
            // TODO: Implement actual refresh logic
            await new Promise(resolve => setTimeout(resolve, 1000));
        },
        refreshDelay: 1000,
    });

    const handlePositionPress = (position: Position) => {
        // TODO: Implement position details navigation OR navigate to coin details?
        console.log('Position pressed:', position);
    };

    const positions = selectedCategory === 'Active' 
        ? positionsData.activePositions 
        : positionsData.inactivePositions;

    const positionCount = selectedCategory === 'Active'
        ? positionsData.activePositionsCount
        : positionsData.inactivePositions.length;

    return (
        <SafeAreaView style={{ ...styles.safeArea, backgroundColor: colors.background }}>
            <ThemedHeader
                title="All Positions"
                subtitle={`${positionCount} ${selectedCategory.toLowerCase()} positions`}
                canRefresh={true}
                onRefresh={handleRefresh}
                showLastUpdated={false}
            />
            
            <CategorySelector
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={(category) => setSelectedCategory(category as PositionCategory)}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {positions.length > 0 ? (
                    positions.map((position, index) => (
                        <PositionCard
                            key={`${position.symbol}-${position.venue}-${index}`}
                            position={position}
                            onPress={() => handlePositionPress(position)}
                            isClosed={selectedCategory === 'Closed'}
                        />
                    ))
                ) : (
                    <ThemedView variant="section" style={styles.emptyContainer} rounded="medium">
                        <ThemedText variant="body" secondary>
                            No {selectedCategory.toLowerCase()} positions
                        </ThemedText>
                    </ThemedView>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 