import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Star, Check } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MarketData } from '@/services/redux/slices/marketDataSlice';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { CryptoIcon } from '@/components/common/CryptoIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { toggleFavorite, selectIsFavorite } from '@/services/redux/slices/favoritesSlice';

export type MarketItemBackground = 'transparent' | 'card';

interface MarketItemProps {
    data: MarketData;
    onPress: () => void;
    canFavorite?: boolean;
    isSelectable?: boolean;
    isSelected?: boolean;
    backgroundVariant?: MarketItemBackground;
}

export function MarketItem({ 
    data, 
    onPress, 
    canFavorite = true,
    isSelectable = false,
    isSelected = false,
    backgroundVariant = 'transparent',
}: MarketItemProps) {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const isFavorite = useSelector(selectIsFavorite(data.instrument));

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        dispatch(toggleFavorite(data.instrument));
    };

    const baseSymbol = data.instrument.split('/')[0];
    const isPositive = data.change24h >= 0;

    const containerStyle = {
        ...styles.container,
        ...(isSelectable && styles.selectableContainer),
        ...(isSelected && { 
            borderColor: `${colors.primary}33`,
            borderWidth: 1
        })
    };

    const contentStyle = {
        ...styles.content,
        ...(isSelectable && styles.selectableContent)
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1_000_000_000) {
            return `${(volume / 1_000_000_000).toFixed(1)}B`;
        } else if (volume >= 1_000_000) {
            return `${(volume / 1_000_000).toFixed(1)}M`;
        } else if (volume >= 1_000) {
            return `${(volume / 1_000).toFixed(1)}K`;
        }
        return volume.toFixed(0);
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={containerStyle}
        >
            <ThemedView 
                variant={backgroundVariant}
                style={contentStyle}
                rounded="medium"
            >
                <View style={styles.leftSection}>
                    <CryptoIcon symbol={baseSymbol} size={32} />
                    <View style={styles.symbolContainer}>
                        <View style={styles.nameContainer}>
                            <ThemedText variant="bodyBold">{baseSymbol}</ThemedText>
                            <ThemedText variant="body" color={colors.textTertiary}>/USDT</ThemedText>
                        </View>
                        <ThemedText variant="caption" secondary>
                            Vol: {formatVolume(data.volume24h)}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    <ThemedText variant="bodyBold">
                        ${data.currentPrice.toLocaleString(undefined, {
                            minimumFractionDigits: data.instrumentInfo?.priceScale || 2,
                            maximumFractionDigits: data.instrumentInfo?.priceScale || 2
                        })}
                    </ThemedText>
                    <ThemedText 
                        variant="caption" 
                        color={isPositive ? colors.success : colors.error}
                    >
                        {isPositive ? '+' : ''}{(data.change24h * 100).toFixed(2)}%
                    </ThemedText>
                </View>

                <View style={[styles.actionsContainer, !canFavorite && styles.actionsContainerNoFavorite]}>
                    {isSelectable && isSelected && (
                        <View style={[styles.checkmarkContainer, { backgroundColor: `${colors.primary}19` }]}>
                            <Check size={16} color={colors.primary} />
                        </View>
                    )}
                    {canFavorite && (
                        <TouchableOpacity
                            onPress={handleFavoritePress}
                            style={styles.favoriteButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Star
                                size={20}
                                color={isFavorite ? colors.primary : colors.textTertiary}
                                fill={isFavorite ? colors.primary : 'transparent'}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </ThemedView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 12,
        marginBottom: 8,
    },
    selectableContainer: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    selectableContent: {
        paddingRight: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    symbolContainer: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightSection: {
        alignItems: 'flex-end',
        marginRight: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 32,
    },
    actionsContainerNoFavorite: {
        minWidth: 0,
    },
    favoriteButton: {
        padding: 4,
    },
    checkmarkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 