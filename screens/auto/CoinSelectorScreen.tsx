import React, { useState, useMemo, useCallback } from 'react';
import { 
    View, 
    StyleSheet, 
    FlatList,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { SearchBar } from '@/components/common/SearchBar';
import { useMarketData } from '@/hooks/useMarketData';
import type { Coin as MarketCoin } from '@/services/MarketDataManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SimpleCoin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

type CoinSelectorScreenRouteProp = RouteProp<{
    CoinSelector: {
        selectedCoins: SimpleCoin[];
        mode: 'DCA' | 'LIQ';
        onCoinsSelected: (coins: SimpleCoin[]) => void;
    }
}, 'CoinSelector'>;

const CoinItem = React.memo(({ 
    coin, 
    isSelected, 
    onPress 
}: { 
    coin: SimpleCoin;
    isSelected: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[styles.coinItem, isSelected && styles.selectedCoin]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.coinInfo}>
            <Image source={{ uri: coin.icon }} style={styles.icon} />
            <View style={styles.coinTexts}>
                <Text style={styles.coinName}>{coin.name}</Text>
                <Text style={styles.coinSymbol}>{coin.symbol}</Text>
            </View>
        </View>

        <View style={styles.priceInfo}>
            <Text style={styles.priceText}>{coin.price}</Text>
            <Text style={[
                styles.changeText,
                coin.isPositive ? styles.positiveChange : styles.negativeChange
            ]}>
                {coin.change24h}
            </Text>
        </View>

        {isSelected && (
            <View style={styles.checkmark}>
                <Check size={16} color="white" />
            </View>
        )}
    </TouchableOpacity>
));

export default function CoinSelectorScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<CoinSelectorScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { marketData, isLoading, error } = useMarketData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoins, setSelectedCoins] = useState<SimpleCoin[]>(route.params.selectedCoins);

    const convertToSimpleCoin = useCallback((coin: MarketCoin): SimpleCoin => ({
        symbol: coin.symbol,
        name: coin.name,
        icon: coin.icon,
        price: coin.priceUSD,
        change24h: coin.change24hFormatted,
        isPositive: coin.isPositive,
    }), []);

    const availableCoins = useMemo(() => {
        const allCoins = Object.values(marketData)
            .flat()
            .filter(data => data.fullSymbol.endsWith('USDT'))
            .map(convertToSimpleCoin);

        const query = searchQuery.toLowerCase();
        return allCoins.filter(coin => 
            coin.symbol.toLowerCase().includes(query) || 
            coin.name.toLowerCase().includes(query)
        );
    }, [marketData, searchQuery, convertToSimpleCoin]);

    const handleCoinPress = useCallback((coin: SimpleCoin) => {
        setSelectedCoins(prev => {
            const isSelected = prev.some(c => c.symbol === coin.symbol);
            if (isSelected) {
                return prev.filter(c => c.symbol !== coin.symbol);
            }
            return [...prev, coin];
        });
    }, []);

    const handleConfirm = useCallback(() => {
        route.params.onCoinsSelected(selectedCoins);
        navigation.goBack();
    }, [selectedCoins, route.params, navigation]);

    const renderItem = useCallback(({ item }: { item: SimpleCoin }) => (
        <CoinItem
            coin={item}
            isSelected={selectedCoins.some(c => c.symbol === item.symbol)}
            onPress={() => handleCoinPress(item)}
        />
    ), [selectedCoins, handleCoinPress]);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.emptyState}>
            <AlertCircle size={24} color="#748CAB" />
            <Text style={styles.emptyStateTitle}>No Coins Found</Text>
            <Text style={styles.emptyStateMessage}>
                {searchQuery 
                    ? 'Try adjusting your search'
                    : 'No coins available for selection'}
            </Text>
        </View>
    ), [searchQuery]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={navigation.goBack}
                >
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Coins</Text>
                <Text style={styles.selectedCount}>
                    {selectedCoins.length} selected
                </Text>
            </View>

            {/* Search */}
            <SearchBar
                placeholder="Search coins..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchBar}
            />

            {/* Coins List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading coins...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <AlertCircle size={24} color="#EF4444" />
                    <Text style={styles.errorText}>Failed to load coins</Text>
                    <Text style={styles.errorSubtext}>Please try again later</Text>
                </View>
            ) : (
                <FlatList
                    data={availableCoins}
                    renderItem={renderItem}
                    keyExtractor={item => item.symbol}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={ListEmptyComponent}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            )}

            {/* Floating Action Button */}
            {selectedCoins.length > 0 && (
                <TouchableOpacity 
                    style={[styles.confirmButton, { marginBottom: insets.bottom + 16 }]}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmButtonText}>
                        Add {selectedCoins.length} coin{selectedCoins.length !== 1 ? 's' : ''}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1B263B',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    selectedCount: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    searchBar: {
        margin: 16,
    },
    listContent: {
        padding: 16,
    },
    coinItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1B263B',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    selectedCoin: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 1,
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    coinTexts: {
        flex: 1,
    },
    coinName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    coinSymbol: {
        fontSize: 14,
        color: '#748CAB',
    },
    priceInfo: {
        alignItems: 'flex-end',
        marginRight: 8,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    changeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    positiveChange: {
        color: '#10B981',
    },
    negativeChange: {
        color: '#EF4444',
    },
    checkmark: {
        backgroundColor: '#3B82F6',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
        fontWeight: '600',
        marginTop: 12,
    },
    errorSubtext: {
        color: '#748CAB',
        fontSize: 14,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyStateTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptyStateMessage: {
        color: '#748CAB',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
}); 