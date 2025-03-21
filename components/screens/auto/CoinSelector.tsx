import React, { useState, useMemo, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    ScrollView, 
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { Check, ChevronRight, AlertCircle } from 'lucide-react-native';
import { SearchBar } from '@/components/common/SearchBar';
import { useMarketData } from '@/hooks/useMarketData';
import type { Coin as MarketCoin } from '@/services/MarketDataManager';

// Local interface for selected coins (simplified version of MarketCoin)
interface SimpleCoin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

interface CoinSelectorProps {
    selectedCoins: SimpleCoin[];
    excludedCoins?: SimpleCoin[];
    onSelect: (coin: SimpleCoin) => void;
    onExclude?: (coin: SimpleCoin) => void;
    mode: 'DCA' | 'LIQ';
    availableCoins?: string[];
}

const CoinItem = React.memo(({ 
    coin, 
    isSelected, 
    isExcluded, 
    onPress, 
    onLongPress,
    disabled = false
}: { 
    coin: SimpleCoin;
    isSelected: boolean;
    isExcluded: boolean;
    onPress: () => void;
    onLongPress?: () => void;
    disabled?: boolean;
}) => (
    <TouchableOpacity
        style={[
            styles.coinItem,
            isSelected && styles.selectedCoin,
            isExcluded && styles.excludedCoin,
            disabled && styles.disabledCoin
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ 
            selected: isSelected,
            disabled: disabled
        }}
        accessibilityLabel={`${coin.name} coin${isSelected ? ' selected' : ''}${isExcluded ? ' excluded' : ''}`}
    >
        <Image 
            source={{ uri: coin.icon }} 
            style={styles.icon}
            accessibilityRole="image"
            accessibilityLabel={`${coin.name} icon`}
        />
        <Text style={[
            styles.symbol,
            disabled && styles.disabledText
        ]} numberOfLines={1}>{coin.name}</Text>
        {isSelected && (
            <View style={styles.checkmark}>
                <Check size={14} color="white" />
            </View>
        )}
        {isExcluded && (
            <View style={[styles.checkmark, styles.excludeMark]}>
                <Text style={styles.excludeX}>X</Text>
            </View>
        )}
    </TouchableOpacity>
));

export const CoinSelector: React.FC<CoinSelectorProps> = ({
    selectedCoins,
    excludedCoins = [],
    onSelect,
    onExclude,
    mode,
    availableCoins = [],
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { marketData, categories, isLoading, error } = useMarketData();

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        if (text.length > 0 && selectedCategory !== null) {
            setSelectedCategory(null); // Reset to "All" when searching
        }
    }, [selectedCategory]);

    const convertToSimpleCoin = useCallback((coin: MarketCoin): SimpleCoin => ({
        symbol: coin.fullSymbol,
        name: coin.name,
        icon: coin.icon,
        price: coin.priceUSD,
        change24h: coin.change24hFormatted,
        isPositive: coin.isPositive,
    }), []);

    const availableCoinsList = useMemo(() => {
        if (mode === 'LIQ') {
            return availableCoins.map(symbol => ({
                symbol: symbol + '/USDT',
                name: symbol,
                icon: `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`,
                price: '0',
                change24h: '0%',
                isPositive: true,
            }));
        }

        let coinsData: MarketCoin[] = [];
        if (selectedCategory && marketData[selectedCategory]) {
            coinsData = marketData[selectedCategory];
        } else {
            coinsData = Object.values(marketData).flat();
        }

        return coinsData
            .filter(data => data.fullSymbol.endsWith('USDT'))
            .map(convertToSimpleCoin);
    }, [mode, availableCoins, selectedCategory, marketData, convertToSimpleCoin]);

    const filteredCoins = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return availableCoinsList.filter(coin => 
            coin.symbol.toLowerCase().includes(query) || 
            coin.name.toLowerCase().includes(query)
        );
    }, [availableCoinsList, searchQuery]);

    const isCoinSelected = useCallback((symbol: string) => 
        selectedCoins.some(selected => selected.symbol === symbol),
        [selectedCoins]
    );

    const isCoinExcluded = useCallback((symbol: string) => 
        excludedCoins.some(excluded => excluded.symbol === symbol),
        [excludedCoins]
    );

    const handleCategoryPress = useCallback((category: string) => {
        setSelectedCategory(category === selectedCategory ? null : category);
    }, [selectedCategory]);
    const { firstRow, secondRow } = useMemo(() => {
        const midpoint = Math.ceil(filteredCoins.length / 2);
        return {
            firstRow: filteredCoins.slice(0, midpoint),
            secondRow: filteredCoins.slice(midpoint)
        };
    }, [filteredCoins]);

    const renderEmptyState = useCallback(() => (
        <View style={styles.emptyState}>
            <AlertCircle size={24} color="#748CAB" />
            <Text style={styles.emptyStateTitle}>No Coins Found</Text>
            <Text style={styles.emptyStateMessage}>
                {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'No coins available for selection'}
            </Text>
        </View>
    ), [searchQuery]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select Coins</Text>
                {selectedCoins.length > 0 && (
                    <Text style={styles.selectedCount}>
                        {selectedCoins.length} selected
                    </Text>
                )}
            </View>
            
            <SearchBar
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChangeText={handleSearch}
                containerStyle={styles.searchBar}
            />

            {mode === 'DCA' && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.categoryBadge,
                            !selectedCategory && styles.selectedCategoryBadge
                        ]}
                        onPress={() => handleCategoryPress('all')}
                        accessibilityRole="tab"
                        accessibilityState={{ 
                            selected: !selectedCategory,
                            disabled: !selectedCategory
                        }}
                        disabled={!selectedCategory}
                    >
                        <Text style={[
                            styles.categoryText,
                            !selectedCategory && styles.selectedCategoryText
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {Object.keys(categories).map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryBadge,
                                selectedCategory === category && styles.selectedCategoryBadge
                            ]}
                            onPress={() => handleCategoryPress(category)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: selectedCategory === category }}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category && styles.selectedCategoryText
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

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
            ) : filteredCoins.length === 0 ? (
                renderEmptyState()
            ) : (
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.coinsScroll}
                    contentContainerStyle={styles.coinsGrid}
                >
                    <View style={styles.coinsRow}>
                        {firstRow.map((coin) => (
                            <CoinItem
                                key={coin.symbol}
                                coin={coin}
                                isSelected={isCoinSelected(coin.symbol)}
                                isExcluded={mode === 'LIQ' && isCoinExcluded(coin.symbol)}
                                onPress={() => onSelect(coin)}
                                onLongPress={mode === 'LIQ' ? () => onExclude?.(coin) : undefined}
                                disabled={isLoading}
                            />
                        ))}
                    </View>
                    <View style={styles.coinsRow}>
                        {secondRow.map((coin) => (
                            <CoinItem
                                key={coin.symbol}
                                coin={coin}
                                isSelected={isCoinSelected(coin.symbol)}
                                isExcluded={mode === 'LIQ' && isCoinExcluded(coin.symbol)}
                                onPress={() => onSelect(coin)}
                                onLongPress={mode === 'LIQ' ? () => onExclude?.(coin) : undefined}
                                disabled={isLoading}
                            />
                        ))}
                    </View>
                </ScrollView>
            )}

            {(selectedCoins.length > 0 || excludedCoins.length > 0) && (
                <View style={styles.selectedList}>
                    {selectedCoins.length > 0 && (
                        <>
                            <Text style={styles.selectedTitle}>Selected Coins</Text>
                            {selectedCoins.map((coin) => (
                                <TouchableOpacity
                                    key={coin.symbol}
                                    style={styles.selectedItem}
                                    onPress={() => onSelect(coin)}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove ${coin.name} from selection`}
                                >
                                    <View style={styles.selectedItemLeft}>
                                        <Image 
                                            source={{ uri: coin.icon }} 
                                            style={styles.selectedIcon}
                                            accessibilityRole="image"
                                            accessibilityLabel={`${coin.name} icon`}
                                        />
                                        <View style={styles.selectedInfo}>
                                            <Text style={styles.selectedSymbol}>{coin.symbol}</Text>
                                            <Text style={styles.selectedName}>{coin.name}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.selectedItemRight}>
                                        <Text style={styles.selectedPrice}>{coin.price}</Text>
                                        <Text style={[
                                            styles.selectedChange,
                                            coin.isPositive ? styles.positiveChange : styles.negativeChange
                                        ]}>
                                            {coin.change24h}
                                        </Text>
                                    </View>
                                    <ChevronRight size={20} color="#748CAB" />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    {mode === 'LIQ' && excludedCoins.length > 0 && (
                        <>
                            <Text style={[styles.selectedTitle, styles.excludedTitle]}>
                                Excluded Coins
                            </Text>
                            {excludedCoins.map((coin) => (
                                <TouchableOpacity
                                    key={coin.symbol}
                                    style={[styles.selectedItem, styles.excludedItem]}
                                    onPress={() => onExclude?.(coin)}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove ${coin.name} from excluded list`}
                                >
                                    <View style={styles.selectedItemLeft}>
                                        <Image 
                                            source={{ uri: coin.icon }} 
                                            style={styles.selectedIcon}
                                            accessibilityRole="image"
                                            accessibilityLabel={`${coin.name} icon`}
                                        />
                                        <View style={styles.selectedInfo}>
                                            <Text style={styles.selectedSymbol}>{coin.symbol}</Text>
                                            <Text style={styles.selectedName}>{coin.name}</Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={20} color="#748CAB" />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    selectedCount: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    searchBar: {
        marginBottom: 16,
    },
    categoriesContainer: {
        marginBottom: 16,
        maxHeight: 36,
    },
    categoriesContent: {
        paddingHorizontal: 4,
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#22314A',
    },
    selectedCategoryBadge: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    categoryText: {
        color: '#748CAB',
        fontSize: 13,
        fontWeight: '500',
    },
    selectedCategoryText: {
        color: 'white',
    },
    coinsScroll: {
        maxHeight: 180,
    },
    coinsGrid: {
        flexDirection: 'column',
        gap: 8,
    },
    coinsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    coinItem: {
        width: 80,
        height: 80,
        backgroundColor: '#22314A',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    selectedCoin: {
        backgroundColor: '#3B82F6',
    },
    excludedCoin: {
        backgroundColor: '#374151',
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    disabledCoin: {
        opacity: 0.5,
    },
    disabledText: {
        color: '#748CAB',
    },
    icon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: 4,
    },
    symbol: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#4CAF50',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    excludeMark: {
        backgroundColor: '#EF4444',
    },
    excludeX: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    selectedList: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#22314A',
        paddingTop: 16,
    },
    selectedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
    },
    excludedTitle: {
        marginTop: 16,
        color: '#EF4444',
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#22314A',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    excludedItem: {
        backgroundColor: '#374151',
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    selectedItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    selectedInfo: {
        flex: 1,
    },
    selectedSymbol: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    selectedName: {
        fontSize: 14,
        color: '#748CAB',
    },
    selectedItemRight: {
        alignItems: 'flex-end',
        marginRight: 8,
    },
    selectedPrice: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
    },
    selectedChange: {
        fontSize: 14,
        marginTop: 2,
    },
    positiveChange: {
        color: '#4CAF50',
    },
    negativeChange: {
        color: '#F44336',
    },
    loadingContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#748CAB',
        fontSize: 14,
        marginTop: 12,
    },
    errorContainer: {
        height: 180,
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
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 16,
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