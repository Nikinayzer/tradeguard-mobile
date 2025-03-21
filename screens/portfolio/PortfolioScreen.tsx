import React, {useState, useCallback} from 'react';
import {View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Text, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {ScreenHeader} from '@/components/screens/portfolio/ScreenHeader';
import {PortfolioSummary} from '@/components/screens/portfolio/PortfolioSummary';
import {OpenPosition, PositionCard} from '@/components/screens/portfolio/PositionCard';
import {ChevronRight} from "lucide-react-native";
import {ClosedPosition, ClosedPositionCard} from "@/components/screens/portfolio/ClosedPositionCard";

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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6"/>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={["#3B82F6"]}
                    />
                }
            >
                <View>
                </View>
                <ScreenHeader
                    title={"Portfolio"}
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                />
                <PortfolioSummary {...portfolioData.summary} />
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Open Positions</Text>
                        <Text style={styles.sectionSubtitle}>{mockData.openPositions.length} active trades</Text>
                    </View>
                    <TouchableOpacity style={styles.seeAllButton}>
                        <Text style={styles.seeAllText}>See All</Text>
                        <ChevronRight size={16} color="#3B82F6"/>
                    </TouchableOpacity>
                </View>
                <View>
                    {portfolioData.openPositions.map(position => (
                        <PositionCard
                            key={position.id}
                            position={position}
                            onPress={() => {
                            }
                            }
                        />
                    ))}
                </View>
                {/* CLOSED POSITIONS */}
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Closed Positions</Text>
                        <Text style={styles.sectionSubtitle}>Last 7 days</Text>
                    </View>
                    <TouchableOpacity style={styles.seeAllButton}>
                        <Text style={styles.seeAllText}>See All</Text>
                        <ChevronRight size={16} color="#3B82F6"/>
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

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0D1B2A",
        paddingBottom: 16,
    },
    container: {
        flex: 1,
        padding: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#0D1B2A",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#748CAB",
        marginTop: 4,
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        color: "#3B82F6",
        fontSize: 14,
        marginRight: 4,
    },
}); 