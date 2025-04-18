import React, {useState, useMemo, useCallback} from "react";
import {
    View,
    StyleSheet,
    FlatList,
    ListRenderItem,
    RefreshControl
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {MarketItem} from "@/components/screens/market/MarketItem";
import {useMarketData} from "@/hooks/useMarketData";
import {Coin, Categories} from "@/services/MarketDataManager";
import {useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MarketStackParamList} from '@/navigation/navigation';
import {usePullToRefresh} from "@/hooks/usePullToRefresh";
import {SearchBar} from "@/components/common/SearchBar";
import {ScreenLoader} from '@/components/common/ScreenLoader';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { useTheme } from '@/contexts/ThemeContext';

interface Section {
    title: string;
    data: Coin[];
}

export default function MarketScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MarketStackParamList>>();
    const {marketData, categories, isLoading, isLoadingInitialData} = useMarketData();
    const [searchQuery, setSearchQuery] = useState("");
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const { colors } = useTheme();

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: async () => {
            setLastUpdated(new Date());
        },
        onError: (error) => {
            console.error('Failed to refresh market data:', error);
        }
    });

    const sections = useMemo(() => {
        if (!marketData || !categories) return [];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const allCoins = Object.values(marketData).flat();
            const filteredCoins = allCoins.filter(coin =>
                coin.symbol.toLowerCase().includes(query) ||
                coin.name.toLowerCase().includes(query) ||
                coin.fullSymbol.toLowerCase().includes(query)
            );
            return [{
                title: "Search Results",
                data: filteredCoins
            }];
        }

        return Object.entries(marketData).map(([category, coins]) => ({
            title: category,
            data: coins
        }));
    }, [marketData, categories, searchQuery]);

    const handleCoinPress = useCallback((coin: Coin) => {
        navigation.navigate('CoinDetail', {symbol: coin.fullSymbol});
    }, [navigation]);

    const renderMarketItem = useCallback(({item}: {item: Coin}) => (
        <MarketItem
            data={{
                instrument: item.fullSymbol,
                currentPrice: item.currentPrice,
                change24h: item.change24h,
                volume24h: item.volume24h,
                high24h: item.high24h,
                low24h: item.low24h,
                instrumentInfo: item.instrumentInfo
            }}
            onPress={() => handleCoinPress(item)}
        />
    ), [handleCoinPress]);

    const renderSection: ListRenderItem<Section> = useCallback(({item: section}) => (
        <ThemedView style={styles.sectionContainer}>
            <ThemedText variant="heading3" style={styles.sectionTitle}>{section.title}</ThemedText>
            <FlatList
                data={section.data}
                renderItem={renderMarketItem}
                keyExtractor={(item) => item.fullSymbol}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectionList}
            />
        </ThemedView>
    ), [renderMarketItem]);

    if (isLoadingInitialData) {
        return (
            <ScreenLoader 
                message="Updating the latest data for you..."
            />
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
                <ThemedHeader
                    title="Market"
                    onRefresh={handleRefresh}
                    canRefresh={true}
                    subtitle="Live prices and market data"
                />
                <SearchBar
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    containerStyle={styles.searchContainer}
                />
                <ThemedView variant="screen" style={styles.container}>
                <FlatList
                    data={sections}
                    renderItem={renderSection}
                    keyExtractor={(section) => section.title}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing || isLoading}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <ThemedView style={styles.emptyContainer}>
                            <ThemedText variant="body" secondary style={styles.emptyText}>
                                {searchQuery ? 'No coins found matching your search' : 'No market data available'}
                            </ThemedText>
                        </ThemedView>
                    }
                />
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
        paddingHorizontal: 10,
        paddingRight: 0,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 8,
        maxWidth:"95%",
        alignSelf:"center",
        marginBottom:5
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionList: {
        paddingLeft: 4,
        paddingRight: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    emptyText: {
        textAlign: 'center',
    },
});
