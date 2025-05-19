import { useSelector } from 'react-redux';
import { RootState } from '@/services/redux/store';
import {
  selectMarketData,
  selectIsLoading,
  selectError,
  selectCategory,
  selectInstrument,
  selectFormattedInstrument,
  selectIsInitialized,
  CategoryData,
  MarketData
} from '@/services/redux/slices/marketDataSlice';

interface UseMarketDataResult {
  marketData: CategoryData;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  getCategory: (category: string) => MarketData[];
  getInstrument: (instrument: string) => MarketData | null;
  getFormattedInstrument: (instrument: string) => (MarketData & {
    priceUSD: string;
    change24hFormatted: string;
    isPositive: boolean;
  }) | null;
}

export function useMarketData(): UseMarketDataResult {
  const marketData = useSelector(selectMarketData);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isInitialized = useSelector(selectIsInitialized);

  const getCategory = (category: string) => useSelector(selectCategory(category));
  const getInstrument = (instrument: string) => useSelector(selectInstrument(instrument));
  const getFormattedInstrument = (instrument: string) => useSelector(selectFormattedInstrument(instrument));

  return {
    marketData,
    isLoading,
    error,
    isInitialized,
    getCategory,
    getInstrument,
    getFormattedInstrument
  };
} 