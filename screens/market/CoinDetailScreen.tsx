import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownRight, DollarSign, Clock, BarChart2, ArrowLeft, TrendingUp, TrendingDown, Percent } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMarketData } from '@/hooks/useMarketData';

export default function CoinDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { symbol } = route.params as { symbol: string };
    const { marketData, isLoading, error } = useMarketData();

    const coin = marketData ? Object.values(marketData)
        .flat()
        .find(coin => coin.instrument === symbol) : null;
    
    const formatVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `$${(volume / 1000000).toFixed(1)}M`;
        }
        return `$${(volume / 1000).toFixed(1)}K`;
    };

    const formatFundingRate = (rate: number) => {
        return `${(rate * 100).toFixed(4)}%`;
    };

    const formatNextFunding = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !coin) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load coin data</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isPositive = coin.change24h >= 0;
    const changePercent = (coin.change24h * 100).toFixed(2);
    const formattedPrice = coin.currentPrice.toFixed(coin.instrumentInfo.priceScale);

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
                            <Text style={styles.symbol}>{symbol.split('/')[0]}</Text>
                            <Text style={styles.pair}>/{symbol.split('/')[1]}</Text>
                        </View>
                        <View style={[
                            styles.change,
                            isPositive ? styles.positiveChange : styles.negativeChange
                        ]}>
                            {isPositive ? (
                                <ArrowUpRight size={16} color="#22C55E" strokeWidth={2.5} />
                            ) : (
                                <ArrowDownRight size={16} color="#EF4444" strokeWidth={2.5} />
                            )}
                            <Text style={[
                                styles.changeText,
                                isPositive ? styles.positiveText : styles.negativeText
                            ]}>
                                {isPositive ? '+' : ''}{changePercent}%
                            </Text>
                        </View>
                    </View>

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>${formattedPrice}</Text>
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
                                ${coin.price24hAgo.toFixed(coin.instrumentInfo.priceScale)}
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
                                <DollarSign size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>Open Interest</Text>
                            </View>
                            <Text style={styles.statValue}>
                                {formatVolume(coin.openInterestValue)}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Percent size={16} color="#748CAB" />
                                <Text style={styles.statLabel}>Funding Rate</Text>
                            </View>
                            <Text style={styles.statValue}>
                                {formatFundingRate(coin.fundingRate)}
                            </Text>
                            <Text style={styles.statSubtext}>
                                Next: {formatNextFunding(coin.nextFundingTime)}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
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
    statSubtext: {
        fontSize: 13,
        color: '#748CAB',
        marginTop: 4,
    },
}); 