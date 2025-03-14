import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import { MarketData } from '@/services/MarketDataManager';

interface MarketItemProps {
    data: MarketData;
    onPress: () => void;
    variant?: 'card' | 'full';
}

export function MarketItem({ data, onPress, variant = 'card' }: MarketItemProps) {
    const [iconError, setIconError] = useState(false);
    const { instrument, currentPrice, volume24h, change24h } = data;

    const baseSymbol = instrument.split('/')[0].toLowerCase();

    const isPositiveChange = change24h >= 0;
    const formattedPrice = `$${currentPrice.toLocaleString('en-US', { 
        minimumFractionDigits: data.instrumentInfo.priceScale, 
        maximumFractionDigits: data.instrumentInfo.priceScale 
    })}`;
    const formattedChange = `${isPositiveChange ? '+' : ''}${(change24h * 100).toFixed(2)}%`;
    
    const formattedVolume = volume24h >= 1000000 
        ? `$${(volume24h / 1000000).toFixed(2)}M`
        : `$${(volume24h / 1000).toFixed(2)}K`;

    return (
        <TouchableOpacity 
            style={[
                styles.container,
                variant === 'full' ? styles.fullContainer : styles.cardContainer
            ]} 
            onPress={onPress}
        >
            <View style={styles.symbolContainer}>
                {iconError ? (
                    <View style={styles.fallbackIcon}>
                        <DollarSign size={32} color="#748CAB" />
                    </View>
                ) : (
                    <Image
                        source={{ uri: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${baseSymbol}.png` }}
                        style={styles.icon}
                        onError={() => setIconError(true)}
                    />
                )}
                <Text style={styles.symbol}>{instrument}</Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.price}>{formattedPrice}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.volumeContainer}>
                    <Text style={styles.label}>Volume 24h</Text>
                    <Text style={styles.value}>{formattedVolume}</Text>
                </View>

                <View style={styles.changeContainer}>
                    <Text style={styles.label}>24h Change</Text>
                    <Text style={[
                        styles.change,
                        isPositiveChange ? styles.positiveChange : styles.negativeChange
                    ]}>
                        {formattedChange}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
    },
    cardContainer: {
        width: (Dimensions.get('window').width - 48) / 1.8,
        marginRight: 12,
    },
    fullContainer: {
        width: '100%',
    },
    symbolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 8,
        borderRadius: 16,
    },
    fallbackIcon: {
        width: 32,
        height: 32,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: '#2D3B4E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    symbol: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    priceContainer: {
        marginBottom: 12,
    },
    priceLabel: {
        color: '#748CAB',
        fontSize: 12,
        marginBottom: 4,
    },
    price: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    volumeContainer: {
        flex: 1,
        marginRight: 12,
    },
    changeContainer: {
        flex: 1,
    },
    label: {
        color: '#748CAB',
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: 'white',
        fontSize: 14,
    },
    change: {
        fontSize: 14,
        fontWeight: '500',
    },
    positiveChange: {
        color: '#34D399',
    },
    negativeChange: {
        color: '#EF4444',
    },
}); 