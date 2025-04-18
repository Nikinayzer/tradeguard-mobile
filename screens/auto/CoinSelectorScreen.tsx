import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { SearchBar } from '@/components/common/SearchBar';
import { useMarketData } from '@/hooks/useMarketData';
import { setSelectedCoins } from '@/services/redux/slices/jobStateSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

interface SimpleCoin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

const CoinItem = React.memo(({ coin, isSelected, onPress }: { coin: SimpleCoin; isSelected: boolean; onPress: () => void; }) => {
    const { colors } = useTheme();
    
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
        >
            <ThemedView 
                variant="card" 
                style={{
                    ...styles.coinItem,
                    ...(isSelected ? {
                        backgroundColor: `${colors.primary}19`,
                        borderColor: colors.primary
                    } : {})
                }}

                rounded="medium"
            >
                <View style={styles.coinInfo}>
                    <Image source={{ uri: coin.icon }} style={styles.icon} />
                    <View style={styles.coinTexts}>
                        <ThemedText variant="bodyBold" style={styles.coinName}>{coin.name}</ThemedText>
                        <ThemedText variant="caption" color={colors.textTertiary}>{coin.symbol}</ThemedText>
                    </View>
                </View>
                <View style={styles.priceInfo}>
                    <ThemedText variant="body">{coin.price}</ThemedText>
                    <ThemedText 
                        variant="caption" 
                        color={coin.isPositive ? colors.profit : colors.loss}
                    >
                        {coin.change24h}
                    </ThemedText>
                </View>
                {isSelected && (
                    <ThemedView 
                        style={styles.checkmark}
                        variant="transparent"
                        rounded="full"
                    >
                        <Check size={16} color={colors.primary} />
                    </ThemedView>
                )}
            </ThemedView>
        </TouchableOpacity>
    );
});

export default function CoinSelectorScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { marketData, isLoading, error } = useMarketData();
    const selectedCoins = useSelector((state: any) => state.job.selectedCoins);
    const [searchQuery, setSearchQuery] = useState('');
    const { colors } = useTheme();

    const convertToSimpleCoin = useCallback((coin: any) => ({
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
        const newSelectedCoins = selectedCoins.some((c: any) => c.symbol === coin.symbol)
            ? selectedCoins.filter((c: any) => c.symbol !== coin.symbol)
            : [...selectedCoins, coin];

        dispatch(setSelectedCoins(newSelectedCoins));
    }, [selectedCoins, dispatch]);

    const handleConfirm = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: SimpleCoin }) => (
        <CoinItem
            coin={item}
            isSelected={selectedCoins.some((c: any) => c.symbol === item.symbol)}
            onPress={() => handleCoinPress(item)}
        />
    ), [selectedCoins, handleCoinPress]);

    const ListEmptyComponent = useCallback(() => (
        <ThemedView style={styles.emptyState} variant="transparent">
            <AlertCircle size={24} color={colors.textTertiary} />
            <ThemedText variant="bodyBold" mt={12} mb={8}>No Coins Found</ThemedText>
            <ThemedText variant="body" color={colors.textSecondary} centered>
                {searchQuery
                    ? 'Try adjusting your search'
                    : 'No coins available for selection'}
            </ThemedText>
        </ThemedView>
    ), [searchQuery, colors]);

    return (
        <ThemedView style={{ ...styles.container, paddingTop: insets.top }} variant="screen">
            {/* Header */}
            <ThemedView style={styles.header} variant="card" border>
                <TouchableOpacity
                    style={{ ...styles.backButton, backgroundColor: `${colors.primary}19` }}
                    onPress={navigation.goBack}
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText variant="heading2" style={styles.headerTitle}>Select Coins</ThemedText>
                <ThemedText variant="label" color={colors.primary} weight="500">
                    {selectedCoins.length} selected
                </ThemedText>
            </ThemedView>

            {/* Search */}
            <SearchBar
                placeholder="Search coins..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchBar}
            />

            {/* Coins List */}
            {isLoading ? (
                <ThemedView style={styles.loadingContainer} variant="transparent">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText variant="body" mt={16}>Loading coins...</ThemedText>
                </ThemedView>
            ) : error ? (
                <ThemedView style={styles.errorContainer} variant="transparent">
                    <AlertCircle size={24} color={colors.error} />
                    <ThemedText variant="bodyBold" color={colors.error} mt={12} mb={8}>Failed to load coins</ThemedText>
                    <ThemedText variant="body" color={colors.textSecondary}>Please try again later</ThemedText>
                </ThemedView>
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
                    style={{
                        ...styles.confirmButton, 
                        marginBottom: insets.bottom + 16, 
                        backgroundColor: colors.primary
                    }}
                    onPress={handleConfirm}
                >
                    <ThemedText variant="button" color={colors.buttonPrimaryText}>
                        Add {selectedCoins.length} coin{selectedCoins.length !== 1 ? 's' : ''}
                    </ThemedText>
                </TouchableOpacity>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 8,
    },
    headerTitle: {
        flex: 1,
        marginLeft: 8,
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
        marginBottom: 8,
        padding: 10,
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
        marginBottom: 4,
    },
    priceInfo: {
        alignItems: 'flex-end',
        marginRight: 8,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});
