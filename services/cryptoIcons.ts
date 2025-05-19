import * as FileSystem from 'expo-file-system';
import { BUNDLED_ICONS, isBundledIcon } from '@/assets/icons/crypto';
import * as BundledIcons from '@/assets/icons/crypto';

const CACHE_KEYS = {
    COIN_LIST: '@coin_list',
    ICON_URLS: '@icon_urls',
} as const;

const RATE_LIMIT = {
    DELAY_BETWEEN_REQUESTS: 1000,
    MAX_RETRIES: 3,
    INITIAL_BACKOFF: 1000,
} as const;

interface CoinData {
    id: string;
    symbol: string;
    name: string;
    image?: {
        thumb?: string;
        small?: string;
        large?: string;
    };
}

interface CoinListItem {
    id: string;
    symbol: string;
    name: string;
}

class CryptoIconsService {
    private static instance: CryptoIconsService;
    private coinList: Map<string, string> = new Map(); // symbol -> id mapping
    private lastRequestTime: number = 0;
    private readonly localAssetsDir: string;

    private constructor() {
        this.localAssetsDir = `${FileSystem.cacheDirectory}crypto-icons/`;
        this.initialize();
    }

    public static getInstance(): CryptoIconsService {
        if (!CryptoIconsService.instance) {
            CryptoIconsService.instance = new CryptoIconsService();
        }
        return CryptoIconsService.instance;
    }

    private async initialize(): Promise<void> {
        try {
            await this.ensureLocalAssetsDir();
            await this.loadCoinList();
        } catch (error) {
            console.error('Failed to initialize crypto icons service:', error);
        }
    }

    private async ensureLocalAssetsDir(): Promise<void> {
        try {
            const dirInfo = await FileSystem.getInfoAsync(this.localAssetsDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.localAssetsDir, { intermediates: true });
            }
        } catch (error) {
            console.error('Error creating local assets directory:', error);
        }
    }

    private async loadCoinList(): Promise<void> {
        try {
            const response = await this.fetchWithRetry('https://api.coingecko.com/api/v3/coins/list');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const coins: CoinListItem[] = await response.json();
            if (!Array.isArray(coins)) {
                throw new Error('Invalid response format: expected array of coins');
            }

            // Update coin list mapping
            this.coinList = new Map(
                coins.map(coin => [coin.symbol.toLowerCase(), coin.id])
            );
        } catch (error) {
            console.error('Error loading coin list:', error);
            throw error;
        }
    }

    private async downloadAndSaveIcon(symbol: string, url: string): Promise<void> {
        try {
            const localPath = `${this.localAssetsDir}${symbol.toLowerCase()}.png`;
            await FileSystem.downloadAsync(url, localPath);
        } catch (error) {
            console.error(`Error downloading icon for ${symbol}:`, error);
        }
    }

    private async getLocalIconPath(symbol: string): Promise<string | null> {
        try {
            const localPath = `${this.localAssetsDir}${symbol.toLowerCase()}.png`;
            const fileInfo = await FileSystem.getInfoAsync(localPath);
            return fileInfo.exists ? localPath : null;
        } catch (error) {
            console.error(`Error checking local icon for ${symbol}:`, error);
            return null;
        }
    }

    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT.DELAY_BETWEEN_REQUESTS) {
            await new Promise(resolve => 
                setTimeout(resolve, RATE_LIMIT.DELAY_BETWEEN_REQUESTS - timeSinceLastRequest)
            );
        }
        this.lastRequestTime = Date.now();
    }

    private async fetchWithRetry(url: string, retryCount = 0): Promise<Response> {
        await this.waitForRateLimit();
        
        try {
            const response = await fetch(url);
            
            if (response.status === 429) {
                if (retryCount >= RATE_LIMIT.MAX_RETRIES) {
                    throw new Error('Max retries reached for rate limit');
                }
                
                const backoffTime = RATE_LIMIT.INITIAL_BACKOFF * Math.pow(2, retryCount);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                return this.fetchWithRetry(url, retryCount + 1);
            }
            
            return response;
        } catch (error) {
            if (retryCount >= RATE_LIMIT.MAX_RETRIES) {
                throw error;
            }
            const backoffTime = RATE_LIMIT.INITIAL_BACKOFF * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            return this.fetchWithRetry(url, retryCount + 1);
        }
    }

    public async getIconUrl(symbol: string): Promise<string | number | null> {
        try {
            const normalizedSymbol = symbol.toLowerCase();

            // First try to get from bundled assets
            if (isBundledIcon(normalizedSymbol)) {
                const bundledIcon = BundledIcons[normalizedSymbol as keyof typeof BundledIcons];
                if (bundledIcon) {
                    return bundledIcon;
                }
            }

            // Check local file system next
            const localPath = await this.getLocalIconPath(normalizedSymbol);
            if (localPath) {
                return localPath; // This will be a string (URI)
            }

            const coinId = this.coinList.get(normalizedSymbol);
            if (!coinId) {
                console.warn(`No coin ID found for symbol: ${symbol}`);
                return null;
            }

            // Fetch coin details
            const response = await this.fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Coin not found: ${symbol} (${coinId})`);
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CoinData = await response.json();
            
            // Try to get the icon URL, preferring small size
            const iconUrl = data.image?.small || data.image?.large || data.image?.thumb;
            
            if (iconUrl) {
                // Download and save locally
                await this.downloadAndSaveIcon(normalizedSymbol, iconUrl);
                return iconUrl;
            }

            console.warn(`No icon URL found for ${symbol} (${coinId})`);
            return null;

        } catch (error) {
            console.warn(`Error fetching details for ${symbol}:`, error);
            return null;
        }
    }
}

export default CryptoIconsService.getInstance(); 