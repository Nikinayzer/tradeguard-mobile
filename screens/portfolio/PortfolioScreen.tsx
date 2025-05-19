import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PortfolioSummary } from '@/components/screens/portfolio/PortfolioSummary';
import { PositionCard } from '@/components/screens/portfolio/PositionCard';
import { ChevronRight, AlertCircle, Plus } from "lucide-react-native";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedHeader } from "@/components/ui/ThemedHeader";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { usePositions, useEquity } from '@/services/redux/hooks';
import { Position } from '@/types/events'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/navigation';
import { formatCurrency, formatNumber } from '@/utils/formatNumber';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PortfolioScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const { colors } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    // Get positions and equity data from Redux
    const positionsData = usePositions();
    const equityData = useEquity();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
        } catch (error) {
            console.error('Error refreshing portfolio data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (!positionsData.lastUpdated && !equityData.lastUpdated) {
            loadData();
        }
    }, []);

    // Update lastUpdated when we get new data
    useEffect(() => {
        if (positionsData.lastUpdated || equityData.lastUpdated) {
            const lastUpdateTime = positionsData.lastUpdated && equityData.lastUpdated 
                ? new Date(Math.max(
                    new Date(positionsData.lastUpdated).getTime(),
                    new Date(equityData.lastUpdated).getTime()
                  ))
                : new Date(positionsData.lastUpdated || equityData.lastUpdated);
                
            setLastUpdated(lastUpdateTime);
        }
    }, [positionsData.lastUpdated, equityData.lastUpdated]);

    const { isRefreshing, handleRefresh } = usePullToRefresh({
        onRefresh: loadData,
        refreshDelay: 1000,
    });

    const handlePositionPress = (position: Position) => {
        // Navigate to position details
        console.log('Position pressed:', position);
    };

    const navigateToAllPositions = (type: 'active' | 'closed') => {
        // Navigate to all positions
        console.log(`Navigate to all ${type} positions`);
    };
    
    const navigateToAddExchange = () => {
        // Navigate to the Profile tab
        // @ts-ignore - Navigation typing is complex with nested navigators
        navigation.navigate('Profile');
    };

    // Show loading indicator during initial load
    if (isLoading && !isRefreshing && !positionsData.activePositions.length) {
        return (
            <ThemedView variant="screen" style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
        );
    }
    
    // Check if the user has any exchange accounts
    const hasNoAccounts = !equityData.venueEquities || equityData.venueEquities.length === 0;

    // Render empty state when there are no venue equities
    if (hasNoAccounts && !isRefreshing) {
        return (
            <SafeAreaView style={{ ...styles.safeArea, backgroundColor: colors.background }}>
                <ThemedHeader
                    title="Portfolio"
                    subtitle="Your active positions and balances"
                    canRefresh={true}
                    onRefresh={handleRefresh}
                    lastUpdated={lastUpdated || undefined}
                    showLastUpdated={false}
                />
                <View style={styles.emptyStateContainer}>
                    <ThemedView 
                        variant="section" 
                        style={styles.emptyStateIcon} 
                        rounded="full"
                    >
                        <AlertCircle size={32} color={colors.primary} />
                    </ThemedView>
                    <ThemedText variant="heading3" style={styles.emptyStateTitle}>
                        No Exchange Accounts Found
                    </ThemedText>
                    <ThemedText variant="body" secondary style={styles.emptyStateDescription}>
                        We could not load your accounts. Perhaps, you have not added one yet?
                    </ThemedText>
                    <ThemedButton 
                        variant="primary" 
                        onPress={navigateToAddExchange} 
                        style={styles.emptyStateButton}
                    >
                        <View style={styles.buttonContent}>
                            <Plus size={18} color={colors.buttonPrimaryText} />
                            <ThemedText variant="button" color={colors.buttonPrimaryText} ml={8}>
                                Add Exchange Account
                            </ThemedText>
                        </View>
                    </ThemedButton>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ ...styles.safeArea, backgroundColor: colors.background }}>
            <ThemedHeader
                title="Portfolio"
                subtitle="Your active positions and balances"
                canRefresh={true}
                onRefresh={handleRefresh}
                lastUpdated={lastUpdated || undefined}
                showLastUpdated={true}
            />
            <ScrollView
                style={styles.container}
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
                <PortfolioSummary 
                    totalWalletBalance={equityData.totalWalletBalance}
                    totalAvailableBalance={equityData.totalAvailableBalance}
                    totalUnrealizedPnl={equityData.totalUnrealizedPnl}
                    totalBnbBalanceUsdt={equityData.totalBnbBalanceUsdt}
                    venueEquities={equityData.venueEquities}
                />

                {/* ACTIVE POSITIONS */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>Open Positions</ThemedText>
                            <ThemedText variant="caption" secondary style={styles.sectionSubtitle}>
                                {positionsData.activePositionsCount} active {positionsData.activePositionsCount === 1 ? 'position' : 'positions'}
                            </ThemedText>
                        </View>
                        <TouchableOpacity 
                            style={styles.seeAllButton}
                            onPress={() => navigateToAllPositions('active')}
                        >
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>
                                See All
                            </ThemedText>
                            <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {positionsData.activePositions.length > 0 ? (
                    <View>
                            {positionsData.activePositions.slice(0, 3).map((position, index) => (
                            <PositionCard
                                    key={`${position.symbol}-${position.venue}-${index}`}
                                position={position}
                                    onPress={() => handlePositionPress(position)}
                            />
                        ))}
                            
                            {positionsData.activePositions.length > 3 && (
                                <TouchableOpacity 
                                    style={styles.viewMoreButton}
                                    onPress={() => navigateToAllPositions('active')}
                                >
                                    <ThemedText variant="bodySmall" color={colors.primary}>
                                        View {positionsData.activePositions.length - 3} more positions
                                    </ThemedText>
                                    <ChevronRight size={14} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                    </View>
                    ) : (
                        <ThemedView variant="section" style={styles.emptyPositionsContainer} rounded="medium">
                            <ThemedText variant="body" secondary>No open positions</ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>

                {/* CLOSED POSITIONS */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>Closed Positions</ThemedText>
                            <ThemedText variant="caption" secondary style={styles.sectionSubtitle}>
                                Recent closed positions
                            </ThemedText>
                        </View>
                        <TouchableOpacity 
                            style={styles.seeAllButton}
                            onPress={() => navigateToAllPositions('closed')}
                        >
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>
                                See All
                            </ThemedText>
                            <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {positionsData.inactivePositions.length > 0 ? (
                    <View>
                            {positionsData.inactivePositions.slice(0, 3).map((position, index) => (
                            <PositionCard
                                    key={`${position.symbol}-${position.venue}-${index}`}
                                position={position}
                                    onPress={() => handlePositionPress(position)}
                                    isClosed={true}
                            />
                        ))}
                            
                            {positionsData.inactivePositions.length > 3 && (
                                <TouchableOpacity 
                                    style={styles.viewMoreButton}
                                    onPress={() => navigateToAllPositions('closed')}
                                >
                                    <ThemedText variant="bodySmall" color={colors.primary}>
                                        View {positionsData.inactivePositions.length - 3} more positions
                                    </ThemedText>
                                    <ChevronRight size={14} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                    </View>
                    ) : (
                        <ThemedView variant="section" style={styles.emptyPositionsContainer} rounded="medium">
                            <ThemedText variant="body" secondary>No closed positions</ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>
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
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        marginRight: 4,
    },
    emptyPositionsContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyStateTitle: {
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateDescription: {
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: '80%',
    },
    emptyStateButton: {
        minWidth: 220,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 