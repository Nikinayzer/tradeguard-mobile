import React, { useState, useMemo, useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { useMarketData } from '@/hooks/useMarketData';
import { addCoin, removeCoin } from '@/services/redux/slices/jobStateSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MarketItem } from '@/components/screens/market/MarketItem';
import { MarketData } from '@/services/redux/slices/marketDataSlice';
import { SearchBar } from '@/components/common/SearchBar';

export default function CoinSelectorScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { marketData, isLoading } = useMarketData();
    const initialSelectedCoins = useSelector((state: any) => state.job.selectedCoins);
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
    const [sortedCoins, setSortedCoins] = useState<MarketData[]>([]);

    useEffect(() => {
        setSelectedCoins(initialSelectedCoins);

        const coins = Object.values(marketData).flat();
        const sorted = [...coins].sort((a, b) => {
            //todo logic below should be at server in initial data.
            const symbol = a.instrument.split('/')[0];
            const base = b.instrument.split('/')[0];
            const symbolSelected = initialSelectedCoins.includes(symbol);
            const baseSelected = initialSelectedCoins.includes(base);
            
            if (symbolSelected && !baseSelected) return -1;
            if (!symbolSelected && baseSelected) return 1;
            return 0;
        });
        
        setSortedCoins(sorted);
    }, [initialSelectedCoins, marketData]);

    // Filter coins based on search
    const filteredCoins = useMemo(() => {
        if (!searchQuery) return sortedCoins;
        
        const query = searchQuery.toLowerCase();
        return sortedCoins.filter(coin => {
            const symbol = coin.instrument.split('/')[0].toLowerCase();
            return symbol.includes(query);
        });
    }, [sortedCoins, searchQuery]);

    const handleCoinPress = (coin: MarketData) => {
        const baseSymbol = coin.instrument.split('/')[0];
        setSelectedCoins(prev => {
            if (prev.includes(baseSymbol)) {
                return prev.filter(symbol => symbol !== baseSymbol);
            } else {
                return [...prev, baseSymbol];
            }
        });
    };

    const handleConfirm = () => {
        const coinsToAdd = selectedCoins.filter((coin: string) => !initialSelectedCoins.includes(coin));
        const coinsToRemove = initialSelectedCoins.filter((coin: string) => !selectedCoins.includes(coin));

        // Dispatch actions for each change
        coinsToAdd.forEach((coin:string) => dispatch(addCoin(coin)));
        coinsToRemove.forEach((coin: string) => dispatch(removeCoin(coin)));

        navigation.goBack();
    };

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

            {/* Search Bar */}
            <ThemedView style={styles.searchContainer} variant="transparent">
                <SearchBar
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </ThemedView>

            {/* Market List */}
            <FlatList
                data={filteredCoins}
                renderItem={({ item }) => {
                    const baseSymbol = item.instrument.split('/')[0];
                    const isSelected = selectedCoins.includes(baseSymbol);
                    return (
                        <MarketItem
                            data={item}
                            onPress={() => handleCoinPress(item)}
                            canFavorite={false}
                            isSelectable={true}
                            isSelected={isSelected}
                            backgroundVariant={isSelected ? "card" : "transparent"}
                        />
                    );
                }}
                keyExtractor={item => item.instrument}
                contentContainerStyle={styles.listContent}
            />

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
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    listContent: {
        paddingBottom: 20,
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
