import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coin, CategoryData, Categories } from  '@/services/MarketDataManager'

interface MarketDataState {
    marketData: Record<string, Coin>;
    categories: Categories;
    lastUpdate: number;
}

const initialState: MarketDataState = {
    marketData: {},
    categories: {},
    lastUpdate: 0,
};

const marketDataSlice = createSlice({
    name: 'marketData',
    initialState,
    reducers: {
        setMarketData: (state, action: PayloadAction<Record<string, Coin>>) => {
            state.marketData = { ...state.marketData, ...action.payload };
        },
        setCategories: (state, action: PayloadAction<Categories>) => {
            state.categories = action.payload;
        },
        setLastUpdate: (state, action: PayloadAction<number>) => {
            state.lastUpdate = action.payload;
        },
    },
});

export const { setMarketData, setCategories, setLastUpdate } = marketDataSlice.actions;
export default marketDataSlice.reducer;