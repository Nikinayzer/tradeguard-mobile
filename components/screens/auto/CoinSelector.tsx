import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Plus, ChevronRight} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/services/redux/store';
import {removeCoin} from '@/services/redux/slices/jobStateSlice';
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedView} from '@/components/ui/ThemedView';
import {useMarketData} from '@/hooks/useMarketData';
import {MarketItem} from '@/components/screens/market/MarketItem';
import { selectMarketData } from '@/services/redux/slices/marketDataSlice';

type NavigationProp = NativeStackNavigationProp<any>;

export function CoinSelector() {
    const dispatch = useDispatch();
    const selectedCoins = useSelector((state: RootState) => state.job.selectedCoins);
    const marketData = useSelector(selectMarketData);
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const handleOpenCoinSelector = () => {
        navigation.navigate('CoinSelector');
    };
    
    const handleRemoveCoin = (symbol: string) => {
        dispatch(removeCoin(symbol));
    };

    return (
        <ThemedView style={styles.selectedCoinsSection} variant="transparent">
            <View style={styles.sectionHeader}>
                <View style={[styles.sectionHeader, {flexDirection: 'column', justifyContent: 'flex-end' }]}>
                    <ThemedText size={22} weight={"bold"}>Your Coins</ThemedText>
                </View>
                {selectedCoins.length > 0 && (
                <TouchableOpacity
                    style={{
                        ...styles.addButton,
                        backgroundColor: `${colors.primary}19`,
                        borderColor: `${colors.primary}33`
                    }}
                    onPress={handleOpenCoinSelector}
                >
                    <Plus size={18} color={colors.primary}/>

                    <ThemedText variant="label" color={colors.primary} ml={8} weight="600">
                        Add Coins
                    </ThemedText>
                </TouchableOpacity>
                )}
            </View>

            {selectedCoins.length > 0 ? (
                <ThemedView style={styles.selectedCoinsContainer} variant="transparent">
                    {selectedCoins.map((symbol) => {
                        const data = Object.values(marketData)
                            .flat()
                            .find(item => item.instrument === `${symbol}/USDT`);
                        
                        if (!data) return null;

                        return (
                            <MarketItem
                                key={symbol}
                                data={data}
                                onPress={() => handleRemoveCoin(symbol)}
                                canFavorite={false}
                                backgroundVariant="card"
                            />
                        );
                    })}
                </ThemedView>
            ) : (
                <ThemedView style={styles.emptyState} variant="transparent">
                    <ThemedView
                        variant="card"
                        style={styles.emptyStateGradient}
                        border
                        rounded="medium"
                        padding="large"
                    >
                        <ThemedText 
                            variant="body" 
                            color={colors.textSecondary}
                            centered
                            mb={16}
                        >
                            Tap the button above to select coins
                        </ThemedText>
                        <TouchableOpacity 
                            style={{
                                ...styles.emptyStateButton,
                                backgroundColor: `${colors.primary}19`,
                                borderColor: `${colors.primary}33`
                            }}
                            onPress={handleOpenCoinSelector}
                        >
                            <ThemedText variant="label" color={colors.primary} weight="600" mr={8}>
                                Browse Available Coins
                            </ThemedText>
                            <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    selectedCoinsSection: {
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
    },
    selectedCoinsContainer: {
        overflow: 'hidden',
    },
    emptyState: {
        marginBottom: 0,
    },
    emptyStateGradient: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
});