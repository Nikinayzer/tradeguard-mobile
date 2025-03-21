import MarketService from '@/services/api/market';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
    MARKET_DATA: '@market_data',
    CATEGORIES: '@categories',
    LAST_UPDATE: '@last_update',
    CACHE_VERSION: '@cache_version'
} as const;

const CACHE_CONFIG = {
    VERSION: '1.0.0',
    MAX_AGE: 5 * 60 * 1000, // 5 minutes
    UPDATE_INTERVAL: 10 * 1000, // 10 seconds
    REFRESH_INTERVAL: 60 * 1000 // 1 minute
} as const;

const logPerformance = (action: string, startTime: number) => {
    const duration = Date.now() - startTime;
    console.log(`🕒 [MarketDataManager] ${action} took ${duration}ms`);
    return duration;
};

export interface InstrumentInfo {
    priceScale: number;
    quantityStep: number;
    timestamp: number;
}

export interface RawMarketData {
    instrument: string;
    currentPrice: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    instrumentInfo: InstrumentInfo;
}

export interface Coin extends RawMarketData {
    symbol: string;
    name: string;
    fullSymbol: string;
    icon: string;
    priceUSD: string;
    change24hFormatted: string;
    isPositive: boolean;
    lastUpdate: number;
}

export interface Categories {
    [category: string]: string[];
}

export interface CategoryData {
    [category: string]: Coin[];
}

export type MarketDataListener = (data: CategoryData) => void;
export type CategoryListener = (categories: Categories) => void;
export type CoinUpdateListener = (coin: Coin) => void;

interface CacheData {
    marketData: CategoryData;
    categories: Categories;
    lastUpdate: number;
    version: string;
}

class MarketDataManager {
    private static instance: MarketDataManager;
    private marketData: Map<string, Coin> = new Map();
    private categoryData: CategoryData = {};
    private categories: Categories = {};
    private updateInterval: NodeJS.Timeout | null = null;
    private marketListeners: Set<MarketDataListener> = new Set();
    private categoryListeners: Set<CategoryListener> = new Set();
    private coinListeners: Map<string, Set<CoinUpdateListener>> = new Map();
    
    private lastFullUpdate: number = 0;
    private lastCategoryUpdate: number = 0;
    private isInitialDataLoaded: boolean = false;
    private isLoadingFromCache: boolean = true;
    private initStartTime: number = 0;

    private constructor() {
        console.log('🚀 [MarketDataManager] Initializing...');
        this.initStartTime = Date.now();
        this.initialize();
    }

    public static getInstance(): MarketDataManager {
        if (!MarketDataManager.instance) {
            MarketDataManager.instance = new MarketDataManager();
        }
        return MarketDataManager.instance;
    }

    private async initialize(): Promise<void> {
        try {
            console.log('📦 [MarketDataManager] Starting initialization...');
            
            // Try to load cached data first
            const cacheStartTime = Date.now();
            await this.loadFromCache();
            const cacheDuration = logPerformance('Cache loading', cacheStartTime);

            // Start fetching fresh data
            console.log('🔄 [MarketDataManager] Fetching fresh data...');
            const fetchStartTime = Date.now();
            
            const categoriesStartTime = Date.now();
            await this.fetchCategories();
            logPerformance('Categories fetch', categoriesStartTime);
            
            const marketDataStartTime = Date.now();
            await this.fetchAllMarketData();
            logPerformance('Market data fetch', marketDataStartTime);
            
            logPerformance('Total fresh data fetch', fetchStartTime);
            
            this.isInitialDataLoaded = true;
            this.isLoadingFromCache = false;
            
            this.startPeriodicUpdates();
            
            const totalDuration = logPerformance('Total initialization', this.initStartTime);
            console.log(`✅ [MarketDataManager] Initialized successfully:
    - Cache load: ${cacheDuration}ms
    - Total time: ${totalDuration}ms
    - Categories: ${Object.keys(this.categories).length}
    - Coins: ${this.marketData.size}`);
            
        } catch (error) {
            console.error('❌ [MarketDataManager] Initialization failed:', error);
            setTimeout(() => this.initialize(), 5000);
        }
    }

    private async loadFromCache(): Promise<void> {
        try {
            console.log('📂 [MarketDataManager] Loading from cache...');
            const startTime = Date.now();

            const version = await AsyncStorage.getItem(CACHE_KEYS.CACHE_VERSION);
            if (version !== CACHE_CONFIG.VERSION) {
                console.log('🔄 [MarketDataManager] Cache version mismatch, clearing cache');
                await this.clearCache();
                return;
            }

            const loadStartTime = Date.now();
            const [lastUpdateStr, cachedCategories, cachedMarketData] = await Promise.all([
                AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE),
                AsyncStorage.getItem(CACHE_KEYS.CATEGORIES),
                AsyncStorage.getItem(CACHE_KEYS.MARKET_DATA)
            ]);
            logPerformance('Cache data load', loadStartTime);

            if (!lastUpdateStr || !cachedCategories || !cachedMarketData) {
                console.log('⚠️ [MarketDataManager] No cache data available');
                return;
            }

            const lastUpdate = parseInt(lastUpdateStr, 10);
            const now = Date.now();

            if (now - lastUpdate > CACHE_CONFIG.MAX_AGE) {
                console.log('⚠️ [MarketDataManager] Cache expired, fetching fresh data');
                return;
            }
            const parseStartTime = Date.now();
            this.categories = JSON.parse(cachedCategories);
            this.categoryData = JSON.parse(cachedMarketData);
            this.lastFullUpdate = lastUpdate;
            logPerformance('Cache data parse', parseStartTime);

            // Rebuild the Map from cached data
            const mapBuildStartTime = Date.now();
            Object.values(this.categoryData).flat().forEach(coin => {
                this.marketData.set(coin.fullSymbol, coin);
            });
            logPerformance('Market data map rebuild', mapBuildStartTime);

            const notifyStartTime = Date.now();
            this.notifyCategoryListeners();
            this.notifyMarketListeners();
            logPerformance('Listener notifications', notifyStartTime);

            const totalDuration = logPerformance('Total cache load', startTime);
            console.log(`✅ [MarketDataManager] Cache loaded successfully:
    - Categories: ${Object.keys(this.categories).length}
    - Coins: ${this.marketData.size}
    - Age: ${Math.floor((now - lastUpdate) / 1000)}s`);
        } catch (error) {
            console.error('❌ [MarketDataManager] Error loading from cache:', error);
            await this.clearCache();
        }
    }

    private async saveToCache(): Promise<void> {
        try {
            const startTime = Date.now();
            console.log('💾 [MarketDataManager] Saving to cache...');

            const cacheData: CacheData = {
                marketData: this.categoryData,
                categories: this.categories,
                lastUpdate: this.lastFullUpdate,
                version: CACHE_CONFIG.VERSION
            };

            await Promise.all([
                AsyncStorage.setItem(CACHE_KEYS.MARKET_DATA, JSON.stringify(this.categoryData)),
                AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(this.categories)),
                AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, this.lastFullUpdate.toString()),
                AsyncStorage.setItem(CACHE_KEYS.CACHE_VERSION, CACHE_CONFIG.VERSION)
            ]);

            logPerformance('Cache save', startTime);
        } catch (error) {
            console.error('❌ [MarketDataManager] Error saving to cache:', error);
        }
    }

    private async clearCache(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(CACHE_KEYS.MARKET_DATA),
                AsyncStorage.removeItem(CACHE_KEYS.CATEGORIES),
                AsyncStorage.removeItem(CACHE_KEYS.LAST_UPDATE),
                AsyncStorage.removeItem(CACHE_KEYS.CACHE_VERSION)
            ]);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    private createCoinInstance(rawData: RawMarketData): Coin {
        const [baseSymbol] = rawData.instrument.split('/');
        
        return {
            ...rawData,
            symbol: baseSymbol,
            name: baseSymbol,
            fullSymbol: rawData.instrument,
            icon: `https://cryptologos.cc/logos/${baseSymbol.toLowerCase()}-${baseSymbol.toLowerCase()}-logo.png`,
            priceUSD: `$${rawData.currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            change24hFormatted: `${rawData.change24h >= 0 ? '+' : ''}${(rawData.change24h * 100).toFixed(2)}%`,
            isPositive: rawData.change24h >= 0,
            lastUpdate: Date.now()
        };
    }

    private async fetchCategories(): Promise<void> {
        try {
            this.categories = await MarketService.getCategories();
            this.lastCategoryUpdate = Date.now();
            this.notifyCategoryListeners();
            await this.saveToCache();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    private async fetchAllMarketData(): Promise<void> {
        try {
            const startTime = Date.now();
            console.log('🔄 [MarketDataManager] Fetching market data...');

            const fetchStartTime = Date.now();
            const rawData = await MarketService.getAllMarketData();
            logPerformance('API fetch', fetchStartTime);

            const processStartTime = Date.now();
            const newCategoryData: CategoryData = {};

            for (const [category, tokens] of Object.entries(rawData)) {
                newCategoryData[category] = tokens.map(tokenData => {
                    const coin = this.createCoinInstance(tokenData as RawMarketData);
                    this.marketData.set(coin.fullSymbol, coin);
                    return coin;
                });
            }

            this.categoryData = newCategoryData;
            this.lastFullUpdate = Date.now();
            logPerformance('Data processing', processStartTime);

            const notifyStartTime = Date.now();
            this.notifyMarketListeners();
            logPerformance('Listener notifications', notifyStartTime);

            const cacheStartTime = Date.now();
            await this.saveToCache();
            logPerformance('Cache save', cacheStartTime);

            const totalDuration = logPerformance('Total market data update', startTime);
            console.log(`✅ [MarketDataManager] Market data updated:
    - Categories: ${Object.keys(this.categoryData).length}
    - Coins: ${this.marketData.size}
    - Total time: ${totalDuration}ms`);
        } catch (error) {
            console.error('❌ [MarketDataManager] Error fetching market data:', error);
            throw error;
        }
    }

    private startPeriodicUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            try {
                const now = Date.now();
                
                if (now - this.lastFullUpdate >= CACHE_CONFIG.REFRESH_INTERVAL) {
                    await this.fetchAllMarketData();
                }
                
                if (now - this.lastCategoryUpdate >= CACHE_CONFIG.MAX_AGE) {
                    await this.fetchCategories();
                }
            } catch (error) {
                console.error('Error during periodic update:', error);
            }
        }, CACHE_CONFIG.UPDATE_INTERVAL);
    }

    public subscribeToCoin(symbol: string, listener: CoinUpdateListener): () => void {
        if (!this.coinListeners.has(symbol)) {
            this.coinListeners.set(symbol, new Set());
        }
        
        const listeners = this.coinListeners.get(symbol)!;
        listeners.add(listener);

        const coin = this.marketData.get(symbol);
        if (coin) {
            listener(coin);
        }
        
        return () => {
            const listeners = this.coinListeners.get(symbol);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.coinListeners.delete(symbol);
                }
            }
        };
    }

    public subscribeToMarketData(listener: MarketDataListener): () => void {
        this.marketListeners.add(listener);

        if (this.isInitialDataLoaded) {
            listener(this.categoryData);
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
            listener(this.categoryData);
        });
    }

    private notifyCategoryListeners(): void {
        this.categoryListeners.forEach(listener => {
            listener(this.categories);
        });
    }

    private notifyCoinListeners(symbol: string, coin: Coin): void {
        const listeners = this.coinListeners.get(symbol);
        if (listeners) {
            listeners.forEach(listener => listener(coin));
        }
    }

    public getCoin(symbol: string): Coin | undefined {
        return this.marketData.get(symbol);
    }

    public getMarketData(): CategoryData {
        return this.categoryData;
    }

    public getCategories(): Categories {
        return this.categories;
    }

    public getCategoryCoins(category: string): Coin[] {
        return this.categoryData[category] || [];
    }

    public isLoaded(): boolean {
        return this.isInitialDataLoaded;
    }

    public isLoadingInitialData(): boolean {
        return !this.isInitialDataLoaded || this.isLoadingFromCache;
    }

    public cleanup(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.marketListeners.clear();
        this.categoryListeners.clear();
        this.coinListeners.clear();
    }
}

export default MarketDataManager; 