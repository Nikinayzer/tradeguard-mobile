import React, {useState, useCallback} from 'react';
import {View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {PortfolioSummary} from '@/components/screens/portfolio/PortfolioSummary';
import {OpenPosition, PositionCard} from '@/components/screens/portfolio/PositionCard';
import {ChevronRight} from "lucide-react-native";
import {ClosedPosition, ClosedPositionCard} from "@/components/screens/portfolio/ClosedPositionCard";
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedHeader} from "@/components/ui/ThemedHeader";

interface PortfolioData {
    summary: {
        netValue: string;
        usdtEquity: string;
        combinedValue: string;
        avgLeverage: string;
    };
    openPositions: OpenPosition[];
    closedTrades: ClosedPosition[];
}

const mockData: PortfolioData = {
    summary: {
        netValue: "$1630.89",
        usdtEquity: "$311.55",
        combinedValue: "$1630.89",
        avgLeverage: "0.00",
    },
    openPositions: [
        {
            id: "1",
            symbol: "SOL",
            direction: "long" as const,
            amount: "2667",
            entry: "141.48",
            mark: "140.39",
            bust: "130.97",
            upl: "-21",
            cumPL: "0",
            change24h: "0.00%",
            lev: "0.00",
            vol: "0.00",
            fund: "0.0000",
            tp: "150.00",
            sl: "135.00"
        },
    ],
    closedTrades: [
        {
            id: "1",
            symbol: "BTC",
            direction: "long",
            amount: "5000",
            entry: "45000",
            exit: "46000",
            pnl: "+1000",
            duration: "2h",
            date: "2024-03-20"
        },
    ],
};

export default function PortfolioScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("Now");
    const [portfolioData, setPortfolioData] = useState(mockData);
    const {colors} = useTheme();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // In production, fetch data from API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLastUpdated("just now");
        } catch (error) {
            console.error('Error loading portfolio data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: loadData,
        refreshDelay: 1000,
    });

    if (isLoading && !isRefreshing) {
        return (
            <ThemedView variant="screen" style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </ThemedView>
        );
    }

    return (
        <SafeAreaView style={{...styles.safeArea, backgroundColor: colors.background}}>
            <ThemedHeader
                title={"Portfolio"}
                subtitle={"Take a look at your assets"}
                canRefresh={true}
                onRefresh={() => console.log("refreshed")}
            />
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                <PortfolioSummary {...portfolioData.summary} />

                {/* OPEN POSITIONS */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>Open Positions</ThemedText>
                            <ThemedText variant="caption" secondary style={styles.sectionSubtitle}>
                                {mockData.openPositions.length} active trades
                            </ThemedText>
                        </View>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>
                                See All
                            </ThemedText>
                            <ChevronRight size={16} color={colors.primary}/>
                        </TouchableOpacity>
                    </View>

                    <View>
                        {portfolioData.openPositions.map(position => (
                            <PositionCard
                                key={position.id}
                                position={position}
                                onPress={() => {
                                }}
                            />
                        ))}
                    </View>
                </ThemedView>

                {/* CLOSED POSITIONS */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>Closed Positions</ThemedText>
                            <ThemedText variant="caption" secondary style={styles.sectionSubtitle}>
                                Last 7 days
                            </ThemedText>
                        </View>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>
                                See All
                            </ThemedText>
                            <ChevronRight size={16} color={colors.primary}/>
                        </TouchableOpacity>
                    </View>

                    <View>
                        {portfolioData.closedTrades.map(position => (
                            <ClosedPositionCard
                                key={position.id}
                                position={position}
                                onPress={() => {
                                }}
                            />
                        ))}
                    </View>
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
}); 