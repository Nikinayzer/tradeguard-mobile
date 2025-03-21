import { useState, useEffect } from 'react';
import MarketDataManager, { CategoryData, Categories } from '@/services/MarketDataManager';

interface UseMarketDataResult {
    marketData: CategoryData;
    categories: Categories;
    isLoading: boolean;
    isLoadingInitialData: boolean;
    error: Error | null;
}

export function useMarketData(): UseMarketDataResult {
    const [marketData, setMarketData] = useState<CategoryData>({});
    const [categories, setCategories] = useState<Categories>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const marketManager = MarketDataManager.getInstance();
        
        const unsubscribeMarket = marketManager.subscribeToMarketData((data) => {
            setMarketData(data);
            setIsLoading(false);
        });

        const unsubscribeCategories = marketManager.subscribeToCategories((cats) => {
            setCategories(cats);
        });

        if (marketManager.isLoaded()) {
            setMarketData(marketManager.getMarketData());
            setCategories(marketManager.getCategories());
            setIsLoading(false);
        }

        return () => {
            unsubscribeMarket();
            unsubscribeCategories();
        };
    }, []);

    return {
        marketData,
        categories,
        isLoading,
        isLoadingInitialData: MarketDataManager.getInstance().isLoadingInitialData(),
        error
    };
} 