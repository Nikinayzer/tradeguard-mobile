import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownRight, Clock, BarChart2, TrendingUp, TrendingDown, ArrowLeft, ArrowRight, DollarSign, Percent, Timer, History, Target } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketData } from '@/services/redux/slices/marketDataSlice';
import { NewsSection } from '@/components/screens/news/NewsSection';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, RootStackParamList, MarketStackParamList } from '@/navigation/navigation';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { CryptoIcon } from '@/components/common/CryptoIcon';
import { formatCompactNumber, formatCurrency } from '@/utils/formatNumber';

type CoinDetailScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<MarketStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
>;

function CoinDetailHeader({ 
    baseSymbol, 
    currentPrice, 
    priceChange, 
    onBack 
}: { 
    baseSymbol: string;
    currentPrice: number;
    priceChange: { value: string; isPositive: boolean };
    onBack: () => void;
}) {
    const { colors } = useTheme();

    return (
        <ThemedView variant="transparent" style={styles.header}>
            <View style={styles.headerContent}>
                <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={onBack}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerMain}>
                    <View style={styles.coinInfo}>
                        <View style={styles.coinText}>
                            <ThemedText variant="heading2" size={24}>{baseSymbol}</ThemedText>
                            <ThemedText variant="body" secondary>/USDT</ThemedText>
                        </View>
                    </View>

                    <ThemedText variant="heading1" size={32}>
                        {formatCompactNumber(currentPrice)}
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
}

function PriceSection({ coin }: { coin: MarketData }) {
    const { colors } = useTheme();
    const price24hAgo = coin.currentPrice / (1 + coin.change24h);
    const isPositive = coin.change24h >= 0;

    return (
        <ThemedView variant="card" style={styles.priceSection}>
            <View style={styles.priceSectionHeader}>
                <View style={styles.priceSectionTitle}>
                    <DollarSign size={20} color={colors.textSecondary} />
                    <ThemedText variant="heading3">Price Information</ThemedText>
                </View>
                <ThemedView 
                    variant="transparent" 
                    style={{
                        ...styles.priceChange,
                        backgroundColor: isPositive ? `${colors.success}15` : `${colors.error}15`
                    }}
                >
                    {isPositive ? (
                        <ArrowUpRight size={16} color={colors.success} strokeWidth={2.5} />
                    ) : (
                        <ArrowDownRight size={16} color={colors.error} strokeWidth={2.5} />
                    )}
                    <ThemedText 
                        variant="bodyBold"
                        color={isPositive ? colors.success : colors.error}
                        style={styles.priceChangeText}
                    >
                        {`${isPositive ? '+' : ''}${(coin.change24h * 100).toFixed(2)}%`}
                    </ThemedText>
                </ThemedView>
            </View>

            <View style={styles.priceContent}>
                {/* Current Price */}
                <View style={styles.currentPriceContainer}>
                    <ThemedText variant="label" secondary>Current Price</ThemedText>
                    <ThemedText variant="heading1" size={32}>
                        ${coin.currentPrice.toFixed(coin.instrumentInfo.priceScale)}
                    </ThemedText>
                </View>

                {/* 24h Range */}
                <View style={styles.priceRangeContainer}>
                    <View style={styles.priceRangeHeader}>
                        <Clock size={16} color={colors.textSecondary} />
                        <ThemedText variant="label" secondary>24h Range</ThemedText>
                    </View>
                    <View style={styles.priceRangeValues}>
                        <View style={styles.priceRangeItem}>
                            <View style={styles.priceLabelContainer}>
                                <ArrowUpRight size={14} color={colors.success} strokeWidth={2.5} />
                                <ThemedText variant="body" secondary>High</ThemedText>
                            </View>
                            <ThemedText 
                                variant="heading2"
                                color={colors.success}
                                size={24}
                            >
                                ${coin.high24h.toFixed(coin.instrumentInfo.priceScale)}
                            </ThemedText>
                        </View>
                        <View style={[styles.priceRangeItem, { marginLeft: 24 }]}>
                            <View style={styles.priceLabelContainer}>
                                <ArrowDownRight size={14} color={colors.error} strokeWidth={2.5} />
                                <ThemedText variant="body" secondary>Low</ThemedText>
                            </View>
                            <ThemedText 
                                variant="heading2"
                                color={colors.error}
                                size={24}
                            >
                                ${coin.low24h.toFixed(coin.instrumentInfo.priceScale)}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>
        </ThemedView>
    );
}

export default function CoinDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<CoinDetailScreenNavigationProp>();
    const { symbol } = route.params as { symbol: string };
    const { getInstrument, isLoading, error } = useMarketData();
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const { colors } = useTheme();

    const coin = getInstrument(symbol);

    useEffect(() => {
        if (coin) {
            setLastUpdate(new Date());
        }
    }, [coin]);
    
    const formatVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `$${(volume / 1000000).toFixed(1)}M`;
        }
        return `$${(volume / 1000).toFixed(1)}K`;
    };

    if (isLoading || !coin) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ThemedView variant="screen" style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText variant="body" secondary style={styles.loadingText}>Loading coin data...</ThemedText>
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (error || !coin) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ThemedView variant="screen" style={styles.errorContainer}>
                    <ThemedText variant="body" color={colors.error} style={styles.errorText}>Failed to load coin data</ThemedText>
                    <TouchableOpacity 
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <ThemedText variant="button" color={colors.buttonPrimaryText}>Go Back</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </SafeAreaView>
        );
    }

    const price24hAgo = coin.currentPrice / (1 + coin.change24h);
    const baseSymbol = coin.instrument.split('/')[0];
    const isPositive = coin.change24h >= 0;
    const formattedPrice = `$${coin.currentPrice.toLocaleString('en-US', { 
        minimumFractionDigits: coin.instrumentInfo?.priceScale || 2, 
        maximumFractionDigits: coin.instrumentInfo?.priceScale || 2 
    })}`;
    const formattedChange = `${isPositive ? '+' : ''}${(coin.change24h * 100).toFixed(2)}%`;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedView variant="screen" style={styles.container}>
                <CoinDetailHeader 
                    baseSymbol={baseSymbol}
                    currentPrice={coin.currentPrice}
                    priceChange={{
                        value: formattedChange,
                        isPositive
                    }}
                    onBack={() => navigation.goBack()}
                />

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Price Section */}
                    <View style={styles.section}>
                        <PriceSection coin={coin} />
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <ThemedView variant="card" style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <BarChart2 size={16} color={colors.textSecondary} />
                                <ThemedText variant="label" secondary>24h Volume</ThemedText>
                            </View>
                            <ThemedText variant="heading2">{formatVolume(coin.volume24h * coin.currentPrice)}</ThemedText>
                        </ThemedView>

                        <ThemedView variant="card" style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Clock size={16} color={colors.textSecondary} />
                                <ThemedText variant="label" secondary>1h Price</ThemedText>
                            </View>
                            <ThemedText variant="heading2">
                                ${coin.price1hAgo.toFixed(coin.instrumentInfo.priceScale)}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView variant="card" style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <BarChart2 size={16} color={colors.textSecondary} />
                                <ThemedText variant="label" secondary>Open Interest</ThemedText>
                            </View>
                            <ThemedText variant="heading2">
                                {formatVolume(coin.openInterestValue)}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView variant="card" style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Percent size={16} color={colors.textSecondary} />
                                <ThemedText variant="label" secondary>Funding Rate</ThemedText>
                            </View>
                            <ThemedText variant="heading2">
                                {(coin.fundingRate * 100).toFixed(4)}%
                            </ThemedText>
                        </ThemedView>

                        <ThemedView variant="card" style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Timer size={16} color={colors.textSecondary} />
                                <ThemedText variant="label" secondary>Next Funding</ThemedText>
                            </View>
                            <ThemedText variant="heading2">
                                {new Date(coin.nextFundingTime).toLocaleTimeString()}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView variant="card" style={styles.statItem}>
                            <View style={styles.statHeader}>
                                <Clock size={16} color={colors.textSecondary} />
                                <ThemedText variant="label" secondary>Last Updated</ThemedText>
                            </View>
                            <ThemedText variant="heading2">
                                {lastUpdate.toLocaleTimeString()}
                            </ThemedText>
                        </ThemedView>
                    </View>

                    {/* News Section */}
                    <View style={styles.newsSection}>
                        <NewsSection 
                            navigation={navigation} 
                            coin={baseSymbol} 
                            itemsPerPage={3} 
                        />
                    </View>
                </ScrollView>
            </ThemedView>
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
    header: {
        padding: 16,
        paddingBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingLeft: 8,
        paddingRight: 16,
    },
    headerMain: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinText: {
        gap: 2,
    },
    priceChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priceChangeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    statsGrid: {
        gap: 16,
        padding: 16,
        marginBottom: 24,
    },
    statItem: {
        padding: 16,
        borderRadius: 12,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    newsSection: {
        padding: 16,
    },
    section: {
        padding: 16,
    },
    priceSection: {
        padding: 16,
        borderRadius: 12,
    },
    priceSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    priceSectionTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceContent: {
        gap: 24,
    },
    currentPriceContainer: {
        gap: 4,
    },
    priceRangeContainer: {
        gap: 8,
    },
    priceRangeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    priceRangeValues: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
    },
    priceRangeItem: {
        flex: 1,
        gap: 4,
    },
    priceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceValue: {
        marginTop: 2,
    },
}); 