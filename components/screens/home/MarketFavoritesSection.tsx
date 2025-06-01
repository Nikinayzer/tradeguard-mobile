import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Star } from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { MarketItem } from '@/components/screens/market/MarketItem';
import { useFavorites } from '@/hooks/useFavorites';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketData } from '@/services/redux/slices/marketDataSlice';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, RootStackParamList } from '@/navigation/navigation';

type FavoriteMarketsNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
>;

interface FavoriteMarketsProps {
    navigation: NativeStackNavigationProp<any>;
}

export function MarketFavoritesSection({ navigation }: FavoriteMarketsProps) {
    const { colors } = useTheme();
    const { marketData, isLoading } = useMarketData();
    const { favorites } = useFavorites();

    const favoriteCoins = React.useMemo(() => {
        if (!marketData) return [];
        
        return favorites
            .map(instrument => {
                for (const category of Object.values(marketData)) {
                    const found = category.find(item => item.instrument === instrument);
                    if (found) return found;
                }
                return null;
            })
            .filter((coin): coin is MarketData => coin !== null)
            .slice(0, 3);
    }, [marketData, favorites]);

    const handleCoinPress = (instrument: string) => {
        navigation.navigate('Main', {
            screen: 'Market',
            params: {
                screen: 'CoinDetail',
                params: { symbol: instrument }
            }
        });
    };

    const handleMarketPress = () => {
        navigation.navigate('Main', {
            screen: 'Market',
            params: {
                screen: 'MarketMain'
            }
        });
    };

    if (isLoading) {
        return null;
    }

    return (
        <ThemedView variant="transparent" style={styles.section}>
            <View style={styles.sectionHeader}>
                <ThemedText variant="heading3" style={styles.sectionTitle}>
                    Favorite Coins
                </ThemedText>
                <TouchableOpacity 
                    style={styles.seeAllButton}
                    onPress={handleMarketPress}
                >
                    <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>
                        See All
                    </ThemedText>
                    <ChevronRight size={16} color={colors.primary}/>
                </TouchableOpacity>
            </View>
            {favoriteCoins.length > 0 ? (
                <View style={styles.marketList}>
                    {favoriteCoins.map((coin) => (
                        <MarketItem
                            key={coin.instrument}
                            data={coin}
                            onPress={() => handleCoinPress(coin.instrument)}
                            canFavorite={true}
                            backgroundVariant="card"
                        />
                    ))}
                </View>
            ) : (
                <TouchableOpacity 
                    style={styles.emptyState}
                    onPress={handleMarketPress}
                >
                    <ThemedView 
                        variant="card" 
                        style={styles.emptyStateContent}
                        border
                        rounded="medium"
                    >
                        <Star size={24} color={colors.primary} />
                        <ThemedText variant="body" style={styles.emptyStateText}>
                            Add coins to your favorites to track them here
                        </ThemedText>
                        <ThemedText variant="bodySmall" color={colors.primary} style={styles.emptyStateSubtext}>
                            Tap to browse markets
                        </ThemedText>
                    </ThemedView>
                </TouchableOpacity>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        marginRight: 4,
    },
    marketList: {
        gap: 8,
    },
    emptyState: {
        marginTop: 8,
    },
    emptyStateContent: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        marginTop: 12,
        marginBottom: 4,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        textAlign: 'center',
    },
}); 