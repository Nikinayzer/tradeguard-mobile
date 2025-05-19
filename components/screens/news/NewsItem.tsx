import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsItem as NewsItemType } from '@/services/api/news';
import * as Linking from 'expo-linking';
import { Globe, Youtube, Clock } from 'lucide-react-native';
import { formatTimeAgo } from '@/utils/formatUtils';
import { CryptoIcon } from '@/components/common/CryptoIcon';

interface NewsItemProps {
    item: NewsItemType;
}

export function NewsItem({ item }: NewsItemProps) {
    const { colors } = useTheme();
    const [imageError, setImageError] = useState(false);

    const getSourceIcon = () => {
        if (item.source.domain === 'youtube.com') {
            return <Youtube size={24} color={colors.textTertiary} />;
        }
        
        if (!imageError) {
            return (
                <Image
                    source={{ uri: `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64` }}
                    style={styles.favicon}
                    onError={() => setImageError(true)}
                />
            );
        }
        
        return <Globe size={24} color={colors.textTertiary} />;
    };

    const handlePress = async () => {
        try {
            await Linking.openURL(item.url);
        } catch (err) {
            console.error('Error opening URL:', err);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.card }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.sourceContainer}>
                        {getSourceIcon()}
                        <ThemedText
                            variant="bodySmall"
                            color={colors.textTertiary}
                            numberOfLines={1}
                            style={styles.source}
                        >
                            {item.source.title}
                        </ThemedText>
                    </View>
                    <View style={styles.timeContainer}>
                        <Clock size={14} color={colors.textTertiary} />
                        <ThemedText
                            variant="caption"
                            color={colors.textTertiary}
                            style={styles.time}
                        >
                            {formatTimeAgo(item.published_at)}
                        </ThemedText>
                    </View>
                </View>
                <ThemedText
                    variant="bodyBold"
                    numberOfLines={2}
                    style={styles.title}
                >
                    {item.title}
                </ThemedText>
                {item.currencies && item.currencies.length > 0 && (
                    <View style={styles.currencies}>
                        {item.currencies.map((currency) => (
                            <View 
                                key={currency.code} 
                                style={[
                                    styles.currencyTag,
                                    { backgroundColor: colors.backgroundSecondary }
                                ]}
                            >
                                <CryptoIcon symbol={currency.code} size={16} />
                                <ThemedText
                                    variant="caption"
                                    color={colors.textSecondary}
                                    style={styles.currencyText}
                                >
                                    {currency.code}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    source: {
        flex: 1,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    time: {
        flexShrink: 0,
    },
    title: {
        marginBottom: 12,
        lineHeight: 20,
    },
    currencies: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    currencyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    currencyText: {
        marginLeft: 2,
    },
    favicon: {
        width: 24,
        height: 24,
        borderRadius: 6,
    },
}); 