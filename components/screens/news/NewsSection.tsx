import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Newspaper } from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsItem } from '@/components/screens/news/NewsItem';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/navigation';
import { ThemedSectionHeader } from '@/components/common/ThemedSectionHeader';
import { newsService, NewsItem as NewsItemType } from '@/services/api/news';

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
        fetchNews(); // Initial fetch
        
        const interval = setInterval(() => {
            fetchNews();
        }, 60000); // Refresh every minute
        
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
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
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
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
    },
}); 