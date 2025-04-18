import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, Dimensions, ViewStyle, Platform } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface MarketItemData {
    instrument: string;
    currentPrice: number;
    volume24h: number;
    change24h: number;
    high24h: number;
    low24h: number;
    instrumentInfo: {
        priceScale: number;
        quantityStep: number;
        timestamp: number;
    };
    price24hAgo?: number;
    price1hAgo?: number;
    openInterestValue?: number;
    fundingRate?: number;
    nextFundingTime?: number;
}

interface MarketItemProps {
    data: MarketItemData;
    onPress: () => void;
    variant?: 'card' | 'full';
}

export function MarketItem({ data, onPress, variant = 'card' }: MarketItemProps) {
    const [iconError, setIconError] = useState(false);
    const { instrument, currentPrice, volume24h, change24h, instrumentInfo } = data;
    const { colors, isDark } = useTheme();

    const baseSymbol = instrument.split('/')[0].toLowerCase();

    const isPositiveChange = change24h >= 0;
    const formattedPrice = `$${currentPrice.toLocaleString('en-US', { 
        minimumFractionDigits: instrumentInfo?.priceScale || 2, 
        maximumFractionDigits: instrumentInfo?.priceScale || 2 
    })}`;
    const formattedChange = `${isPositiveChange ? '+' : ''}${(change24h * 100).toFixed(2)}%`;
    
    const formattedVolume = volume24h >= 1000000 
        ? `$${(volume24h / 1000000).toFixed(2)}M`
        : `$${(volume24h / 1000).toFixed(2)}K`;

    const containerStyle: ViewStyle = {
        marginRight: 12,
        marginVertical: 4,
        width: variant === 'full' ? '100%' : (Dimensions.get('window').width - 48) / 1.8,
        ...Platform.select({
            ios: {
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.1 : 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    };

    return (
        <ThemedView 
            variant="card"
            rounded="medium"
            border={isDark}
            style={containerStyle}
        >
            <TouchableOpacity 
                style={styles.touchable}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <ThemedView style={styles.symbolContainer}>
                    {iconError ? (
                        <ThemedView 
                            style={styles.fallbackIcon}
                            variant="section"
                            rounded="full"
                        >
                            <DollarSign size={32} color={colors.textTertiary} />
                        </ThemedView>
                    ) : (
                        <Image
                            source={{ uri: `https://cryptologos.cc/logos/${baseSymbol}-${baseSymbol}-logo.png` }}
                            style={styles.icon}
                            onError={() => setIconError(true)}
                        />
                    )}
                    <ThemedText variant="bodyBold" mb={2}>{instrument}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.priceContainer}>
                    <ThemedText variant="caption" secondary>Price</ThemedText>
                    <ThemedText variant="heading3">{formattedPrice}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.statsContainer}>
                    <ThemedView style={styles.volumeContainer}>
                        <ThemedText variant="caption" secondary>Volume 24h</ThemedText>
                        <ThemedText variant="body">{formattedVolume}</ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.changeContainer}>
                        <ThemedText variant="caption" secondary>24h Change</ThemedText>
                        <ThemedText 
                            variant="bodyBold"
                            color={isPositiveChange ? colors.profit : colors.loss}
                        >
                            {formattedChange}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    touchable: {
        padding: 16,
    },
    symbolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 12,
        borderRadius: 16,
    },
    fallbackIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceContainer: {
        marginBottom: 14,
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
}); 