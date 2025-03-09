import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

interface Coin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

interface CoinSelectorProps {
    selectedCoins: Coin[];
    onSelect: (coin: Coin) => void;
}

const COINS: Coin[] = [
    {
        symbol: 'BTC/USDT',
        name: 'Bitcoin',
        icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        price: '$45,000.00',
        change24h: '+2.5%',
        isPositive: true,
    },
    {
        symbol: 'ETH/USDT',
        name: 'Ethereum',
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        price: '$3,200.00',
        change24h: '-1.2%',
        isPositive: false,
    },
    {
        symbol: 'BNB/USDT',
        name: 'Binance Coin',
        icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
        price: '$320.00',
        change24h: '+0.8%',
        isPositive: true,
    },
    {
        symbol: 'SOL/USDT',
        name: 'Solana',
        icon: 'https://cryptologos.cc/logos/solana-sol-logo.png',
        price: '$142.39',
        change24h: '+5.67%',
        isPositive: true,
    },
    {
        symbol: 'ADA/USDT',
        name: 'Cardano',
        icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
        price: '$0.89',
        change24h: '-2.1%',
        isPositive: false,
    },
];

export const CoinSelector: React.FC<CoinSelectorProps> = ({
    selectedCoins,
    onSelect,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Coins</Text>
            <View style={styles.coinsGrid}>
                {COINS.map((coin) => {
                    const isSelected = selectedCoins.some(
                        selected => selected.symbol === coin.symbol
                    );
                    return (
                        <TouchableOpacity
                            key={coin.symbol}
                            style={[
                                styles.coinItem,
                                isSelected && styles.selectedCoin,
                            ]}
                            onPress={() => onSelect(coin)}
                        >
                            <Image source={{ uri: coin.icon }} style={styles.icon} />
                            <Text style={styles.symbol}>{coin.symbol}</Text>
                            {isSelected && (
                                <View style={styles.checkmark}>
                                    <Check size={14} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {selectedCoins.length > 0 && (
                <View style={styles.selectedList}>
                    <Text style={styles.selectedTitle}>Selected Coins</Text>
                    {selectedCoins.map((coin) => (
                        <TouchableOpacity
                            key={coin.symbol}
                            style={styles.selectedItem}
                            onPress={() => onSelect(coin)}
                        >
                            <View style={styles.selectedItemLeft}>
                                <Image source={{ uri: coin.icon }} style={styles.selectedIcon} />
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
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 16,
    },
    coinsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    coinItem: {
        width: '23%',
        aspectRatio: 1,
        backgroundColor: '#22314A',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    selectedCoin: {
        backgroundColor: '#3B82F6',
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
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#22314A',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
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
}); 