import React, {useState, useMemo, useCallback, useRef} from "react";
import {
    View,
    StyleSheet,
    FlatList,
    ListRenderItem,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    Animated
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {MarketItem} from "@/components/screens/market/MarketItem";
import {useMarketData} from "@/hooks/useMarketData";
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
import { MarketData } from '@/services/redux/slices/marketDataSlice';
import { useSelector } from 'react-redux';
import { selectLastUpdate } from '@/services/redux/slices/marketDataSlice';
import { useFavorites } from '@/hooks/useFavorites';
import { Star, ChevronRight } from 'lucide-react-native';
import { CategorySelector } from '@/components/screens/market/CategorySelector';

interface Section {
    title: string;
    data: MarketData[];
}

export default function MarketScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MarketStackParamList>>();
    const {marketData, isLoading, error} = useMarketData();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Favorites");
    const lastUpdate = useSelector(selectLastUpdate);
    const { colors } = useTheme();
    const { favorites } = useFavorites();
    const scrollViewRef = useRef<ScrollView>(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: async () => {
            // No need to update, handling from SSE
        },
        onError: (error) => {
            console.error('Failed to refresh market data:', error);
        }
    });

    const categories = useMemo(() => {
        if (!marketData) return ["Favorites"];
        return ["Favorites", "All", ...Object.keys(marketData)];
    }, [marketData]);

    const currentSection = useMemo(() => {
        if (!marketData) return null;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const allCoins = Object.values(marketData).flat();
            const filteredCoins = allCoins.filter(coin =>
                coin.instrument.toLowerCase().includes(query)
            );
            return {
                title: "Search Results",
                data: filteredCoins
            };
        }

        if (selectedCategory === "Favorites") {
            const favoriteCoins = favorites
                .map(instrument => {
                    for (const category of Object.values(marketData)) {
                        const found = category.find(item => item.instrument === instrument);
                        if (found) return found;
                    }
                    return null;
                })
                .filter((coin): coin is MarketData => coin !== null);

            return {
                title: "Favorites",
                data: favoriteCoins
            };
        }

        if (selectedCategory === "All") {
            const allCoins = Object.values(marketData).flat();
            const sortedCoins = [...allCoins].sort((a, b) => 
                a.instrument.localeCompare(b.instrument)
            );
            return {
                title: "All Coins",
                data: sortedCoins
            };
        }

        return {
            title: selectedCategory,
            data: marketData[selectedCategory] || []
        };
    }, [marketData, searchQuery, selectedCategory, favorites]);

    const handleCoinPress = useCallback((coin: MarketData) => {
        navigation.navigate('CoinDetail', {symbol: coin.instrument});
    }, [navigation]);

    const renderMarketItem = useCallback(({item}: {item: MarketData}) => (
        <MarketItem
            data={item}
            onPress={() => handleCoinPress(item)}
        />
    ), [handleCoinPress]);

    const handleScroll = (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const isScrollable = contentSize.width > layoutMeasurement.width;
        const isAtEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 10;
        
        if (isScrollable && !isAtEnd) {
            setShowScrollIndicator(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setShowScrollIndicator(false);
            });
        }
    };

    const renderDivider = () => (
        <View style={{ 
            height: 0.5, 
            backgroundColor: colors.cardBorder,
            opacity: 0.3,
            marginHorizontal: 16 
        }} />
    );

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        if (text) {
            setSelectedCategory("All");
        }
    }, []);

    if (isLoading) {
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
                lastUpdated={new Date(lastUpdate)}
            />
            <SearchBar
                placeholder="Search coins..."
                value={searchQuery}
                onChangeText={handleSearch}
                containerStyle={styles.searchContainer}
            />
            <ThemedView style={styles.container}>
                <ThemedView style={styles.categoryContainer}>
                    <CategorySelector 
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </ThemedView>
                {selectedCategory === "Favorites" ? (
                    <FlatList
                        data={currentSection ? currentSection.data : []}
                        renderItem={renderMarketItem}
                        keyExtractor={(item) => item.instrument}
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
                                    {searchQuery 
                                        ? 'No coins found matching your search' 
                                        : 'Add coins to your favorites to see them here'}
                                </ThemedText>
                            </ThemedView>
                        }
                        ItemSeparatorComponent={renderDivider}
                    />
                ) : (
                    <FlatList
                        data={currentSection ? currentSection.data : []}
                        renderItem={renderMarketItem}
                        keyExtractor={(item) => item.instrument}
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
                                    {searchQuery 
                                        ? 'No coins found matching your search' 
                                        : 'No market data available'}
                                </ThemedText>
                            </ThemedView>
                        }
                        ItemSeparatorComponent={renderDivider}
                    />
                )}
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
        paddingHorizontal: 0,
        paddingRight: 0,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 8,
        maxWidth: "95%",
        alignSelf: "center",
        marginBottom: 5
    },
    listContent: {
        paddingBottom: 20,
        paddingHorizontal: 0,
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
    categoryContainer: {
        marginTop: 8,
        paddingHorizontal: 10,
    },
});
