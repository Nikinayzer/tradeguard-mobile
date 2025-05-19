import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface InstrumentInfo {
  priceScale: number;
  quantityStep: number;
  timestamp: number;
}

export interface MarketData {
  instrument: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  price24hAgo: number;
  price1hAgo: number;
  volume24h: number;
  openInterestValue: number;
  fundingRate: number;
  nextFundingTime: number;
  instrumentInfo: InstrumentInfo;
}

export interface CategoryData {
  [category: string]: MarketData[];
}

interface MarketDataState {
  data: CategoryData;
  lastUpdate: number;
  error: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: MarketDataState = {
  data: {},
  lastUpdate: 0,
  error: null,
  isLoading: false,
  isInitialized: false,
};

const marketDataSlice = createSlice({
  name: 'marketData',
  initialState,
  reducers: {
    setMarketData: (state, action: PayloadAction<CategoryData>) => {
      state.data = action.payload;
      state.lastUpdate = Date.now();
      state.error = null;
      state.isLoading = false;
      state.isInitialized = true;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setMarketData, setError, setLoading } = marketDataSlice.actions;
export default marketDataSlice.reducer;

// Selectors
export const selectMarketData = (state: RootState) => state.marketData.data;
export const selectLastUpdate = (state: RootState) => state.marketData.lastUpdate;
export const selectError = (state: RootState) => state.marketData.error;
export const selectIsLoading = (state: RootState) => state.marketData.isLoading;
export const selectIsInitialized = (state: RootState) => state.marketData.isInitialized;

export const selectCategory = (category: string) => (state: RootState) => 
  state.marketData.data[category] || [];

export const selectInstrument = (instrument: string) => (state: RootState) => {
  for (const category of Object.values(state.marketData.data)) {
    const found = category.find((item: MarketData) => item.instrument === instrument);
    if (found) return found;
  }
  return null;
};

// Helper selectors for formatted data
export const selectFormattedInstrument = (instrument: string) => (state: RootState) => {
  const data = selectInstrument(instrument)(state);
  if (!data) return null;

  return {
    ...data,
    priceUSD: `$${data.currentPrice.toLocaleString(undefined, {
      minimumFractionDigits: data.instrumentInfo?.priceScale || 2,
      maximumFractionDigits: data.instrumentInfo?.priceScale || 2
    })}`,
    change24hFormatted: `${data.change24h >= 0 ? '+' : ''}${(data.change24h * 100).toFixed(2)}%`,
    isPositive: data.change24h >= 0,
  };
};