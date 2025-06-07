import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Newspaper, Ghost } from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsItem } from '@/components/screens/news/NewsItem';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/navigation';
import { ThemedSectionHeader } from '@/components/common/ThemedSectionHeader';
import { newsService, NewsItem as NewsItemType } from '@/services/api/news';
import { ThemedText } from '@/components/ui/ThemedText';

type NewsSectionNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<any>,
    NativeStackNavigationProp<RootStackParamList>
>;

interface NewsSectionProps {
    navigation: NativeStackNavigationProp<any>;
    itemsPerPage?: number;
    coin?: string;
}

export function NewsSection({ navigation, itemsPerPage = 3, coin }: NewsSectionProps) {
    const { colors } = useTheme();
    const [news, setNews] = useState<NewsItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = coin 
                ? await newsService.getNewsForCoin(coin, 1)
                : await newsService.getNews(1);
            
            if (!response || !response.results) {
                setNews([]);
                setError('No news available');
                return;
            }

            setNews(response.results.slice(0, itemsPerPage));
            setError(null);
        } catch (err) {
            setError('Failed to fetch news');
            console.error('Error fetching news:', err);
            setNews([]);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, coin]);

    useEffect(() => {
        fetchNews();
        
        const interval = setInterval(() => {
            fetchNews();
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    const handleNewsPress = () => {
        navigation.navigate('News', { initialPage: currentPage, coin });
    };

    if (loading && news.length === 0) {
        return (
            <ThemedView variant="transparent" style={styles.section}>
                <ThemedSectionHeader
                    title={coin ? `${coin} News` : "Latest News"}
                    icon={<Newspaper size={20} color={colors.primary}/>}
                    showSeeAll={true}
                    onSeeAll={handleNewsPress}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            </ThemedView>
        );
    }

    if (error && news.length === 0) {
        return (
            <ThemedView variant="transparent" style={styles.section}>
                <ThemedSectionHeader
                    title={coin ? `${coin} News` : "Latest News"}
                    icon={<Newspaper size={20} color={colors.primary}/>}
                    showSeeAll={true}
                    onSeeAll={handleNewsPress}
                />
                <ThemedView style={styles.emptyState} variant="transparent">
                    <Ghost size={48} color={colors.textTertiary} style={styles.emptyStateIcon} />
                    <ThemedText variant="heading3" style={styles.emptyStateTitle}>
                        No News Available
                    </ThemedText>
                    <ThemedText variant="body" secondary style={styles.emptyStateText}>
                        Who stole the news? We're using a free API, so sometimes the news might be playing hide and seek!
                    </ThemedText>
                </ThemedView>
            </ThemedView>
        );
    }

    return (
        <ThemedView variant="transparent" style={styles.section}>
            <ThemedSectionHeader
                title={coin ? `${coin} News` : "Latest News"}
                icon={<Newspaper size={20} color={colors.primary}/>}
                showSeeAll={true}
                onSeeAll={handleNewsPress}
            />
            <View style={styles.newsList}>
                {news.map((item) => (
                    <NewsItem key={item.id} item={item} />
                ))}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    newsList: {
        gap: 8,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateIcon: {
        marginBottom: 16,
        opacity: 0.7,
    },
    emptyStateTitle: {
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        textAlign: 'center',
        lineHeight: 20,
    },
}); 