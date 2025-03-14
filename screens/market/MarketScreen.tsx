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
import {MarketData} from "@/services/MarketDataManager";
import {useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MarketStackParamList} from '@/navigation/navigation';
import {ScreenHeader} from "@/components/screens/portfolio/ScreenHeader";
import {usePullToRefresh} from "@/hooks/usePullToRefresh";
import {SearchBar} from "@/components/common/SearchBar";

interface Section {
    title: string;
    data: MarketData[];
}

export default function MarketScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MarketStackParamList>>();
    const {marketData, categories, isLoading, error, getTokenData} = useMarketData();
    const [searchQuery, setSearchQuery] = useState("");
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: async () => {
            await Promise.all(
                Object.values(categories || {})
                    .flat()
                    .map(symbol => getTokenData(symbol))
            );
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
                coin.instrument.toLowerCase().includes(query)
            );
            return [{
                title: "Search Results",
                data: filteredCoins
            }];
        }

        return Object.keys(categories).map(category => ({
            title: category,
            data: marketData[category] || []
        }));
    }, [marketData, categories, searchQuery]);

    const handleCoinPress = (coin: MarketData) => {
        navigation.navigate('CoinDetail', {symbol: coin.instrument});
    };

    const renderSection: ListRenderItem<Section> = ({item: section}) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
                data={section.data}
                renderItem={({item}) => (
                    <MarketItem
                        data={item}
                        onPress={() => handleCoinPress(item)}
                    />
                )}
                keyExtractor={(item) => item.instrument}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectionList}
            />
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScreenHeader
                    title="Market"
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6"/>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScreenHeader
                    title="Market"
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load market data</Text>
                </View>
            </SafeAreaView>
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
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#3B82F6"
                            colors={["#3B82F6"]}
                        />
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
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
});
