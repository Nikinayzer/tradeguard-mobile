import * as fs from 'fs';
import * as path from 'path';
import fetch, { Response } from 'node-fetch';

/**
 * This script is used to download cryptocurrency icons from the CoinGecko API,
 * since it's rate limited and icons can not be fetched in runtime.
 * Use it before bundling the app. Script will run indefinitely until all icons are downloaded.
 * 1. The script fetches a list of coins.
 * 2. The script checks if the icons already exist in the specified directory.
 * 3. The script downloads the icons for the specified coins (either remaining or all at once).
 */
const RATE_LIMIT = {
    DELAY_BETWEEN_REQUESTS: 5000,
    MAX_RETRIES: 3,
    INITIAL_BACKOFF: 1000,
} as const;

const ICONS_DIR = path.join(__dirname, '../assets/icons/crypto');
const COIN_LIST = [
    'BTC', 'ETH', 'BNB', 'XRP', 'SOL',
    'ENA', 'AIXBT', 'FARTCOIN',
    'XLM', 'HBAR', 'LINK', 'TRX', 'TON', 'WLD',
    'ADA', 'DOT', 'AVAX', 'ATOM', 'NEAR',
    'UNI', 'AAVE', 'SUSHI', 'COMP', 'MKR',
    'XMR', 'ZEC', 'DASH', 'BEAM',
    'DOGE', '1000PEPE', 'TRUMP', 'WIF', 'MOODENG',
    'OP', 'ARB', 'IMX', 'LRC',
    'APT', 'SUI', 'KAS', 'RENDER', 'GRT'
];

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

class IconDownloader {
    private lastRequestTime: number = 0;
    private coinList: Map<string, string> = new Map();
    private failedDownloads: string[] = [];
    private existingIcons: Set<string> = new Set();
    private invalidSymbols: Set<string> = new Set();

    constructor() {
        this.ensureDirectoryExists();
        this.loadExistingIcons();
    }

    private ensureDirectoryExists(): void {
        if (!fs.existsSync(ICONS_DIR)) {
            fs.mkdirSync(ICONS_DIR, { recursive: true });
        }
    }

    private loadExistingIcons(): void {
        try {
            const files = fs.readdirSync(ICONS_DIR);
            this.existingIcons = new Set(
                files
                    .filter(file => file.endsWith('.png'))
                    .map(file => file.replace('.png', '').toLowerCase())
            );
            console.log(`Found ${this.existingIcons.size} existing icons`);
        } catch (error) {
            console.error('Error loading existing icons:', error);
            this.existingIcons = new Set();
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
                console.log(`Rate limit hit, waiting... (attempt ${retryCount + 1}/${RATE_LIMIT.MAX_RETRIES})`);
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

    private async loadCoinList(): Promise<void> {
        try {
            console.log('Fetching coin list...');
            const response = await this.fetchWithRetry('https://api.coingecko.com/api/v3/coins/list');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const coins: CoinData[] = await response.json();
            if (!Array.isArray(coins)) {
                throw new Error('Invalid response format: expected array of coins');
            }

            this.coinList = new Map(
                coins.map(coin => [coin.symbol.toLowerCase(), coin.id])
            );
            console.log(`Loaded ${this.coinList.size} coins`);
        } catch (error) {
            console.error('Error loading coin list:', error);
            throw error;
        }
    }

    private async downloadIcon(symbol: string): Promise<void> {
        const normalizedSymbol = symbol.toLowerCase();

        // Skip if icon already exists or symbol is known to be invalid
        if (this.existingIcons.has(normalizedSymbol) || this.invalidSymbols.has(normalizedSymbol)) {
            console.log(`Skipping ${symbol} - ${this.existingIcons.has(normalizedSymbol) ? 'icon already exists' : 'symbol is invalid'}`);
            return;
        }

        const coinId = this.coinList.get(normalizedSymbol);

        if (!coinId) {
            console.warn(`No coin ID found for symbol: ${symbol} - excluding from future attempts`);
            this.invalidSymbols.add(normalizedSymbol);
            return;
        }

        try {
            console.log(`Fetching details for ${symbol}...`);
            const response = await this.fetchWithRetry(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Coin not found: ${symbol} (${coinId}) - excluding from future attempts`);
                    this.invalidSymbols.add(normalizedSymbol);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CoinData = await response.json();
            const iconUrl = data.image?.small || data.image?.large || data.image?.thumb;
            
            if (!iconUrl) {
                console.warn(`No icon URL found for ${symbol} - excluding from future attempts`);
                this.invalidSymbols.add(normalizedSymbol);
                return;
            }

            console.log(`Downloading icon for ${symbol}...`);
            const iconResponse = await this.fetchWithRetry(iconUrl);
            if (!iconResponse.ok) {
                throw new Error(`Failed to download icon for ${symbol}`);
            }

            const buffer = await iconResponse.buffer();
            const filePath = path.join(ICONS_DIR, `${normalizedSymbol}.png`);
            fs.writeFileSync(filePath, buffer);
            this.existingIcons.add(normalizedSymbol);
            console.log(`✅ Saved icon for ${symbol}`);

        } catch (error) {
            console.error(`Error downloading icon for ${symbol}:`, error);
            this.failedDownloads.push(symbol);
        }
    }

    public async downloadAllIcons(): Promise<void> {
        try {
            await this.loadCoinList();
            
            // Filter out coins that already have icons or are known to be invalid
            const remainingCoins = COIN_LIST.filter(symbol => 
                !this.existingIcons.has(symbol.toLowerCase()) && 
                !this.invalidSymbols.has(symbol.toLowerCase())
            );

            if (remainingCoins.length === 0) {
                console.log('\nAll valid icons are already downloaded!');
                if (this.invalidSymbols.size > 0) {
                    console.log('\nInvalid symbols that were excluded:');
                    Array.from(this.invalidSymbols).forEach(symbol => console.log(`- ${symbol}`));
                }
                return;
            }

            console.log(`\nStarting icon downloads for ${remainingCoins.length} remaining coins...`);
            for (const symbol of remainingCoins) {
                await this.downloadIcon(symbol);
            }

            // Keep retrying failed downloads indefinitely until all succeed
            let retryCount = 0;
            while (this.failedDownloads.length > 0) {
                retryCount++;
                console.log(`\nRetry cycle ${retryCount} for ${this.failedDownloads.length} failed downloads...`);
                const failed = [...this.failedDownloads];
                this.failedDownloads = [];
                
                for (const symbol of failed) {
                    await this.downloadIcon(symbol);
                }

                // Add a delay between retry cycles to avoid overwhelming the API
                if (this.failedDownloads.length > 0) {
                    console.log('Waiting 5 seconds before next retry cycle...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }

            console.log('\nDownload Summary:');
            console.log(`Total coins: ${COIN_LIST.length}`);
            console.log(`Already downloaded: ${this.existingIcons.size}`);
            console.log(`Newly downloaded: ${remainingCoins.length}`);
            console.log(`Total retry cycles: ${retryCount}`);
            if (this.invalidSymbols.size > 0) {
                console.log('\nInvalid symbols that were excluded:');
                Array.from(this.invalidSymbols).forEach(symbol => console.log(`- ${symbol}`));
            }

        } catch (error) {
            console.error('Error in download process:', error);
            console.log('Retrying the entire download process...');
            await this.downloadAllIcons();
        }
    }
}

const downloader = new IconDownloader();
downloader.downloadAllIcons().catch(console.error); 