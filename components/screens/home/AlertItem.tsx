import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, ArrowRight } from 'lucide-react-native';

interface AlertItemProps {
    symbol: string;
    type: 'price' | 'volume' | 'technical';
    condition: string;
    value: string;
    onPress?: () => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({
    symbol,
    type,
    condition,
    value,
    onPress,
}) => {
    const getTypeColor = () => {
        switch (type) {
            case 'price':
                return '#4CAF50';
            case 'volume':
                return '#2196F3';
            case 'technical':
                return '#FF9800';
            default:
                return '#748CAB';
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor()}20` }]}>
                    <Bell size={16} color={getTypeColor()} />
                </View>
                <Text style={styles.symbol}>{symbol}</Text>
                <ArrowRight size={16} color="#748CAB" />
            </View>
            <View style={styles.details}>
                <Text style={styles.condition}>{condition}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1B263B',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    symbol: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    condition: {
        fontSize: 14,
        color: '#748CAB',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
}); 