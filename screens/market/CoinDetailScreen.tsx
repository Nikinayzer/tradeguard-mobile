import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownRight, DollarSign, Clock, BarChart2, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMarketData } from '@/hooks/useMarketData';
import MarketDataManager, { type Coin } from '@/services/MarketDataManager';

export default function CoinDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { symbol } = route.params as { symbol: string };
    const { isLoading, error } = useMarketData();
    const [coin, setCoin] = useState<Coin | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // Get initial coin data
        const marketManager = MarketDataManager.getInstance();
        const initialCoin = marketManager.getCoin(symbol);
        if (initialCoin) {
            setCoin(initialCoin);
            setLastUpdate(new Date(initialCoin.lastUpdate));
        }

        const unsubscribe = marketManager.subscribeToCoin(symbol, (updatedCoin) => {
            setCoin(updatedCoin);
            setLastUpdate(new Date(updatedCoin.lastUpdate));
        });

        return () => {
            unsubscribe();
        };
    }, [symbol]);
    
    const formatVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `$${(volume / 1000000).toFixed(1)}M`;
        }
        return `$${(volume / 1000).toFixed(1)}K`;
    };

    if (isLoading || !coin) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading coin data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !coin) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load coin data</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const price24hAgo = coin.currentPrice / (1 + coin.change24h);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Back Button */}
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.symbol}>{coin.symbol}</Text>
                            <Text style={styles.pair}>/USDT</Text>
                        </View>
                        <View style={[
                            styles.change,
                            coin.isPositive ? styles.positiveChange : styles.negativeChange
                        ]}>
                            {coin.isPositive ? (
                                <ArrowUpRight size={16} color="#22C55E" strokeWidth={2.5} />
                            ) : (
                                <ArrowDownRight size={16} color="#EF4444" strokeWidth={2.5} />
                            )}
                            <Text style={[
                                styles.changeText,
                                coin.isPositive ? styles.positiveText : styles.negativeText
                            ]}>
                                {coin.change24hFormatted}
                            </Text>
                        </View>
                    </View>

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>{coin.priceUSD}</Text>
                        <Text style={styles.priceLabel}>Current Price</Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <BarChart2 size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>24h Volume</Text>
                            </View>
                            <Text style={styles.statValue}>{formatVolume(coin.volume24h)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Clock size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>24h Price</Text>
                            </View>
                            <Text style={styles.statValue}>
                                ${price24hAgo.toFixed(coin.instrumentInfo.priceScale)}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <TrendingUp size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>24h High</Text>
                            </View>
                            <Text style={styles.statValue}>
                                ${coin.high24h.toFixed(coin.instrumentInfo.priceScale)}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <TrendingDown size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>24h Low</Text>
                            </View>
                            <Text style={styles.statValue}>
                                ${coin.low24h.toFixed(coin.instrumentInfo.priceScale)}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Clock size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>Last Updated</Text>
                            </View>
                            <Text style={styles.statValue}>
                                {lastUpdate.toLocaleTimeString()}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D1B2A',
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
    loadingText: {
        color: '#748CAB',
        fontSize: 16,
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    backButton: {
        marginBottom: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1B263B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    symbol: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
    },
    pair: {
        fontSize: 16,
        color: '#748CAB',
        marginLeft: 4,
    },
    change: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    positiveChange: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    negativeChange: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    changeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    positiveText: {
        color: '#22C55E',
    },
    negativeText: {
        color: '#EF4444',
    },
    priceSection: {
        marginBottom: 32,
    },
    price: {
        fontSize: 42,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    priceLabel: {
        fontSize: 16,
        color: '#748CAB',
    },
    statsGrid: {
        gap: 16,
    },
    statItem: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#22314A',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#748CAB',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
}); 