import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import {Plus, X} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/services/redux/store';
import {setSelectedCoins} from '@/services/redux/slices/jobStateSlice';
import {Coin} from "@/services/MarketDataManager";
import {useNavigation} from "@react-navigation/native";


export function CoinSelector() {
    const dispatch = useDispatch();
    const selectedCoins = useSelector((state: RootState) => state.job.selectedCoins);
    const navigation = useNavigation();

    const handleOpenCoinSelector = () => {
        navigation.navigate('CoinSelector');
    };
    const handleRemoveCoin = (coin: Coin) => {
        const updatedSelectedCoins = selectedCoins.filter(c => c.symbol !== coin.symbol);
        dispatch(setSelectedCoins(updatedSelectedCoins)); // Dispatch the updated selected coins to Redux
    };

    return (
        // Selected Coins Section
        <View style={styles.selectedCoinsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Selected Coins</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleOpenCoinSelector}
                >
                    <Plus size={20} color="#3B82F6"/>
                    <Text style={styles.addButtonText}>Add Coins</Text>
                </TouchableOpacity>
            </View>

            {selectedCoins.length > 0 ? (
                <View
                    style={styles.selectedCoinsList}
                    showsVerticalScrollIndicator={false}
                >
                    {selectedCoins.map((coin) => (
                        <TouchableOpacity
                            key={coin.symbol}
                            style={styles.selectedCoinItem}
                            onPress={() => handleRemoveCoin(coin)}
                        >
                            <View style={styles.coinInfo}>
                                <Image source={{uri: coin.icon}} style={styles.coinIcon}/>
                                <View style={styles.coinTexts}>
                                    <Text style={styles.coinName}>{coin.name}</Text>
                                    <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                                </View>
                            </View>
                            <X size={20} color="#748CAB"/>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        Tap the button above to select coins
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    selectedCoinsSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    selectedCoinsList: {
    },
    selectedCoinItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    coinIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    coinTexts: {
        flex: 1,
    },
    coinName: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    coinSymbol: {
        fontSize: 12,
        color: '#748CAB',
    },
    emptyState: {
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    emptyStateText: {
        color: '#748CAB',
        fontSize: 14,
        textAlign: 'center',
    },
});