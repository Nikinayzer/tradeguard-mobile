import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EquityEvent, VenueEquity } from '@/types/events';

export interface EquityState {
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalUnrealizedPnl: number;
  totalBnbBalanceUsdt: number;
  lastUpdated: string;
  venueEquities: VenueEquity[];
}

const initialState: EquityState = {
  totalWalletBalance: 0,
  totalAvailableBalance: 0,
  totalUnrealizedPnl: 0,
  totalBnbBalanceUsdt: 0,
  lastUpdated: '',
  venueEquities: [],
};

const equitySlice = createSlice({
  name: 'equity',
  initialState,
  reducers: {
    updateEquity: (state, action: PayloadAction<EquityEvent>) => {
      const {
        totalWalletBalance,
        totalAvailableBalance,
        totalUnrealizedPnl,
        totalBnbBalanceUsdt,
        timestamp,
        venueEquities,
      } = action.payload;

      state.totalWalletBalance = totalWalletBalance;
      state.totalAvailableBalance = totalAvailableBalance;
      state.totalUnrealizedPnl = totalUnrealizedPnl;
      state.totalBnbBalanceUsdt = totalBnbBalanceUsdt;
      state.lastUpdated = timestamp;
      state.venueEquities = venueEquities;
    },
    clearEquity: (state) => {
      return initialState;
    },
  },
});

export const { updateEquity, clearEquity } = equitySlice.actions;
export default equitySlice.reducer; 