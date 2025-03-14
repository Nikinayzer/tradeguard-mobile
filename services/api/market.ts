import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { CategoryData, Categories, MarketData } from '../MarketDataManager';

class MarketService {
    /**
     * Fetches all market data categorized by token types
     * @returns Promise with categorized market data
     */
    static async getAllMarketData(): Promise<CategoryData> {
        try {
            const response = await apiClient.get<CategoryData>(API_ENDPOINTS.market.getAll);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch market data:', error);
            throw new Error('Failed to fetch market data');
        }
    }

    /**
     * Fetches available market categories and their tokens
     * @returns Promise with categories and their tokens
     */
    static async getCategories(): Promise<Categories> {
        try {
            const response = await apiClient.get<Categories>(API_ENDPOINTS.market.getCategories);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }

    /**
     * Fetches market data for specific tokens
     * @param symbols Array of token symbols (e.g., ["BTC", "ETH"])
     * @returns Promise with array of market data for requested tokens
     */
    static async getTokensData(symbols: string[]): Promise<MarketData[]> {
        try {
            const response = await apiClient.get<MarketData[]>(
                API_ENDPOINTS.market.getTokens(symbols)
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch token data:', error);
            throw new Error('Failed to fetch token data');
        }
    }

    /**
     * Fetches market data for a single token
     * @param symbol Token symbol (e.g., "BTC")
     * @returns Promise with market data for requested token
     */
    static async getTokenData(symbol: string): Promise<MarketData | null> {
        try {
            const data = await this.getTokensData([symbol]);
            return data[0] || null;
        } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error);
            throw new Error(`Failed to fetch data for ${symbol}`);
        }
    }
}

export default MarketService; 