import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

interface MarketItemProps {
    symbol: string;
    price: string;
    change: string;
    isPositive: boolean;
    onPress?: () => void;
}

export const MarketItem: React.FC<MarketItemProps> = ({
    symbol,
    price,
    change,
    isPositive,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.symbolContainer}>
                <Text style={styles.symbol}>{symbol}</Text>
                <Text style={styles.price}>{price}</Text>
            </View>
            <View style={[styles.changeContainer, isPositive ? styles.positive : styles.negative]}>
                {isPositive ? (
                    <ArrowUpRight size={16} color="#4CAF50" />
                ) : (
                    <ArrowDownRight size={16} color="#F44336" />
                )}
                <Text style={[styles.change, isPositive ? styles.positiveText : styles.negativeText]}>
                    {change}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#1B263B',
        borderRadius: 8,
        marginBottom: 8,
    },
    symbolContainer: {
        flex: 1,
    },
    symbol: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#748CAB',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    positive: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    negative: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    change: {
        fontSize: 14,
        fontWeight: '500',
    },
    positiveText: {
        color: '#4CAF50',
    },
    negativeText: {
        color: '#F44336',
    },
}); 