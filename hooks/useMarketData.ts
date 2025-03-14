import { useState, useEffect } from 'react';
import MarketDataManager, { CategoryData, Categories, MarketData } from '@/services/MarketDataManager';

interface UseMarketDataResult {
    marketData: CategoryData;
    categories: Categories;
    isLoading: boolean;
    error: Error | null;
    getTokenData: (symbol: string) => Promise<MarketData | null>;
    getCategoryData: (category: string) => MarketData[];
}

export function useMarketData(): UseMarketDataResult {
    const [marketData, setMarketData] = useState<CategoryData>({});
    const [categories, setCategories] = useState<Categories>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const manager = MarketDataManager.getInstance();

        const marketUnsubscribe = manager.subscribeToMarketData((data) => {
            setMarketData(data);
            setIsLoading(false);
        });

        const categoriesUnsubscribe = manager.subscribeToCategories((cats) => {
            setCategories(cats);
        });

        return () => {
            marketUnsubscribe();
            categoriesUnsubscribe();
        };
    }, []);

    const getTokenData = async (symbol: string): Promise<MarketData | null> => {
        try {
            return await MarketDataManager.getInstance().getTokenData(symbol);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch token data'));
            return null;
        }
    };

    const getCategoryData = (category: string): MarketData[] => {
        return MarketDataManager.getInstance().getCategoryData(category);
    };

    return {
        marketData,
        categories,
        isLoading,
        error,
        getTokenData,
        getCategoryData,
    };
} 