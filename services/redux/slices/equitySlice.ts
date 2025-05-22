import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EquityEvent, VenueEquity } from '@/types/events';

export interface EquityState {
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalUnrealizedPnl: number;
  totalBnbBalance: number;
  lastUpdated: string;
  venueEquities: VenueEquity[];
}

const initialState: EquityState = {
  totalWalletBalance: 0,
  totalAvailableBalance: 0,
  totalUnrealizedPnl: 0,
  totalBnbBalance: 0,
  lastUpdated: '',
  venueEquities: [],
};

const equitySlice = createSlice({
  name: 'equity',
  initialState,
  reducers: {
    updateEquity: (state, action: PayloadAction<EquityEvent>) => {
      const {
        summary,
        venueEquities,
      } = action.payload;

      state.totalWalletBalance = summary.totalWalletBalance;
      state.totalAvailableBalance = summary.totalAvailableBalance;
      state.totalUnrealizedPnl = summary.totalUnrealizedPnl;
      state.totalBnbBalance = summary.totalBnbBalance;
      state.lastUpdated = summary.lastUpdate;
      state.venueEquities = venueEquities;
    },
    clearEquity: (state) => {
      return initialState;
    },
  },
});

export const { updateEquity, clearEquity } = equitySlice.actions;
export default equitySlice.reducer; 