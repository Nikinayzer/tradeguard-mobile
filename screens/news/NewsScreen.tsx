import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, MarketStackParamList } from '@/navigation/navigation';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsItem } from '@/components/screens/news/NewsItem';
import { newsService, NewsItem as NewsItemType } from '@/services/api/news';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ghost } from 'lucide-react-native';

type NewsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList | MarketStackParamList>;
type NewsScreenRouteProp = RouteProp<HomeStackParamList | MarketStackParamList, 'News'>;

export default function NewsScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<NewsScreenNavigationProp>();
    const route = useRoute<NewsScreenRouteProp>();
    const [news, setNews] = useState<NewsItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(route.params?.initialPage || 1);
    const [hasMore, setHasMore] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
    const coin = route.params?.coin;

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = coin 
                ? await newsService.getNewsForCoin(coin, currentPage)
                : await newsService.getNews(currentPage);

            if (!response || !response.results) {
                setNews([]);
                setError('No news available');
                setHasMore(false);
                return;
            }

            if (currentPage === 1) {
                setNews(response.results);
            } else {
                setNews(prev => [...prev, ...response.results]);
            }
            setHasMore(response.results.length > 0);
            setError(null);
            setLastUpdate(Date.now());
        } catch (err) {
            setError('Failed to fetch news');
            console.error('Error fetching news:', err);
            setNews([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const { isRefreshing, handleRefresh } = usePullToRefresh({
        onRefresh: async () => {
            setCurrentPage(1);
            await fetchNews();
        },
        onError: (error) => {
            setError('Failed to refresh news');
            console.error('Error refreshing news:', error);
        },
    });

    useEffect(() => {
        fetchNews();
    }, [currentPage, coin]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const renderItem = ({ item }: { item: NewsItemType }) => (
        <NewsItem item={item} />
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const renderEmptyState = () => {
        if (loading) return null;
        
        return (
            <ThemedView style={styles.emptyState} variant="transparent">
                <Ghost size={64} color={colors.textTertiary} style={styles.emptyStateIcon} />
                <ThemedText variant="heading2" style={styles.emptyStateTitle}>
                    No News Available
                </ThemedText>
                <ThemedText variant="body" secondary style={styles.emptyStateText}>
                    Who stole the news? We're using a free API, so sometimes the news might be playing hide and seek!
                </ThemedText>
            </ThemedView>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedHeader
                title={coin ? `${coin} News` : "Latest News"}
                subtitle={coin ? `Stay updated with ${coin} news` : "Stay updated with crypto news"}
                canGoBack={true}
                onBack={() => navigation.goBack()}
                canRefresh={true}
                onRefresh={handleRefresh}
                lastUpdated={new Date(lastUpdate)}
                showLastUpdated={true}
            />
            <FlatList
                data={news}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={[
                    styles.list,
                    news.length === 0 && !loading && styles.emptyList
                ]}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        gap: 8,
    },
    emptyList: {
        flex: 1,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateIcon: {
        marginBottom: 24,
        opacity: 0.7,
    },
    emptyStateTitle: {
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateText: {
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 32,
    },
}); 