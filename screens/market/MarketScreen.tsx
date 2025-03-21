import React, {useState, useMemo, useCallback} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ListRenderItem,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {MarketItem} from "@/components/screens/market/MarketItem";
import {useMarketData} from "@/hooks/useMarketData";
import {Coin, Categories} from "@/services/MarketDataManager";
import {useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MarketStackParamList} from '@/navigation/navigation';
import {ScreenHeader} from "@/components/screens/portfolio/ScreenHeader";
import {usePullToRefresh} from "@/hooks/usePullToRefresh";
import {SearchBar} from "@/components/common/SearchBar";
import {ScreenLoader} from '@/components/common/ScreenLoader';

interface Section {
    title: string;
    data: Coin[];
}

export default function MarketScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MarketStackParamList>>();
    const {marketData, categories, isLoading, isLoadingInitialData} = useMarketData();
    const [searchQuery, setSearchQuery] = useState("");
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: async () => {
            setLastUpdated(new Date().toLocaleTimeString());
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
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
                data={section.data}
                renderItem={renderMarketItem}
                keyExtractor={(item) => item.fullSymbol}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectionList}
            />
        </View>
    ), [renderMarketItem]);

    if (isLoadingInitialData) {
        return (
            <ScreenLoader 
                message="Updating the latest data for you..."
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScreenHeader
                    title="Market"
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                />
                <SearchBar
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    containerStyle={styles.searchContainer}
                />

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
                            tintColor="#3B82F6"
                            colors={["#3B82F6"]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No coins found matching your search' : 'No market data available'}
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0D1B2A",
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#748CAB',
        marginTop: 12,
        fontSize: 16,
    },
    searchContainer: {
        marginBottom: 16,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionList: {
        paddingLeft: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: '#748CAB',
        fontSize: 16,
        textAlign: 'center',
    },
});
