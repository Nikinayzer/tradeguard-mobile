import React from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Plus, X, ChevronRight} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/services/redux/store';
import {setSelectedCoins} from '@/services/redux/slices/jobStateSlice';
import {Coin} from "@/services/MarketDataManager";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedTitle} from '@/components/ui/ThemedTitle';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedView} from '@/components/ui/ThemedView';

type NavigationProp = NativeStackNavigationProp<any>;

export function CoinSelector() {
    const dispatch = useDispatch();
    const selectedCoins = useSelector((state: RootState) => state.job.selectedCoins);
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const handleOpenCoinSelector = () => {
        navigation.navigate('CoinSelector');
    };
    
    const handleRemoveCoin = (coin: Coin) => {
        const updatedSelectedCoins = selectedCoins.filter(c => c.symbol !== coin.symbol);
        dispatch(setSelectedCoins(updatedSelectedCoins));
    };

    const renderCoinItem = (item: Coin) => (
        <TouchableOpacity
            key={item.symbol}
            style={styles.selectedCoinItem}
            onPress={() => handleRemoveCoin(item)}
            activeOpacity={0.7}
        >
            <ThemedView 
                variant="card" 
                style={styles.selectedCoinItemContent}
                border
                rounded="medium"
                padding="medium"
            >
                <View style={styles.coinInfo}>
                    <Image source={{uri: item.icon}} style={styles.coinIcon}/>
                    <View style={styles.coinTexts}>
                        <ThemedText variant="bodyBold" style={styles.coinName}>{item.name}</ThemedText>
                        <ThemedText variant="caption" color={colors.textTertiary}>{item.symbol}</ThemedText>
                    </View>
                </View>
                <ThemedView 
                    style={styles.removeIconContainer} 
                    variant="section" 
                    rounded="full"
                >
                    <X size={16} color={colors.textTertiary}/>
                </ThemedView>
            </ThemedView>
        </TouchableOpacity>
    );

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
                    {selectedCoins.map(coin => renderCoinItem(coin))}
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
    selectedCoinItem: {
        marginBottom: 5,
    },
    selectedCoinItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    coinIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 14,
    },
    coinTexts: {
        flex: 1,
    },
    coinName: {
        marginBottom: 4,
    },
    removeIconContainer: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
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