import MarketService from '@/services/api/market';

export interface InstrumentInfo {
    priceScale: number;
    quantityScale: number;
    minQuantity: number;
    maxQuantity: number;
    stepSize: number;
    minNotional: number;
    maxNotional: number;
}

export interface MarketData {
    instrument: string;
    currentPrice: number;
    price24hAgo: number;
    change24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    instrumentInfo: InstrumentInfo;
    lastUpdate: string;
}

/**
 * Categories available in the market
 */
export interface Categories {
    [category: string]: string[];
}

/**
 * Market data categorized by token types
 */
export interface CategoryData {
    [category: string]: MarketData[];
}

/**
 * Listener function type for market events
 */
export type MarketDataListener = (data: CategoryData) => void;
export type CategoryListener = (categories: Categories) => void;

/**
 * Singleton class that manages market data, including fetching, caching, and real-time updates
 */
class MarketDataManager {
    private static instance: MarketDataManager;
    private marketData: CategoryData = {};
    private categories: Categories = {};
    private updateInterval: NodeJS.Timeout | null = null;
    private marketListeners: Set<MarketDataListener> = new Set();
    private categoryListeners: Set<CategoryListener> = new Set();
    private lastUpdateTime: number = 0;
    private readonly MARKET_UPDATE_INTERVAL = 60000;
    private readonly CACHE_DURATION = 300000; // 5min

    private constructor() {
        this.startPeriodicUpdates();
    }

    public static getInstance(): MarketDataManager {
        if (!MarketDataManager.instance) {
            MarketDataManager.instance = new MarketDataManager();
        }
        return MarketDataManager.instance;
    }

    private async fetchCategories(): Promise<void> {
        try {
            this.categories = await MarketService.getCategories();
            this.notifyCategoryListeners();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    private async fetchAllMarketData(): Promise<void> {
        try {
            this.marketData = await MarketService.getAllMarketData();
            this.lastUpdateTime = Date.now();
            this.notifyMarketListeners();
        } catch (error) {
            console.error('Error fetching market data:', error);
            throw error;
        }
    }

    private startPeriodicUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        Promise.all([
            this.fetchCategories(),
            this.fetchAllMarketData()
        ]).catch(error => {
            console.error('Error during initial data fetch:', error);
        });

        this.updateInterval = setInterval(async () => {
            try {
                await this.fetchAllMarketData();
            } catch (error) {
                console.error('Error during periodic update:', error);
            }
        }, this.MARKET_UPDATE_INTERVAL);
    }

    public subscribeToMarketData(listener: MarketDataListener): () => void {
        this.marketListeners.add(listener);

        if (Object.keys(this.marketData).length > 0 && 
            Date.now() - this.lastUpdateTime < this.CACHE_DURATION) {
            listener(this.marketData);
        }

        return () => {
            this.marketListeners.delete(listener);
        };
    }

    public subscribeToCategories(listener: CategoryListener): () => void {
        this.categoryListeners.add(listener);

        if (Object.keys(this.categories).length > 0) {
            listener(this.categories);
        }

        return () => {
            this.categoryListeners.delete(listener);
        };
    }

    private notifyMarketListeners(): void {
        this.marketListeners.forEach(listener => {
            listener(this.marketData);
        });
    }

    private notifyCategoryListeners(): void {
        this.categoryListeners.forEach(listener => {
            listener(this.categories);
        });
    }

    public async getTokenData(symbol: string): Promise<MarketData | null> {
        return await MarketService.getTokenData(symbol);
    }

    public getMarketData(): CategoryData {
        return this.marketData;
    }

    public getCategoryData(category: string): MarketData[] {
        return this.marketData[category] || [];
    }

    public cleanup(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.marketListeners.clear();
        this.categoryListeners.clear();
    }
}

export default MarketDataManager; 