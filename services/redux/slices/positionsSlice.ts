import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PositionsEvent, Position } from '@/types/events';

export interface PositionsState {
  totalPositionValue: number;
  totalUnrealizedPnl: number;
  lastUpdated: string;
  activePositions: Position[];
  inactivePositions: Position[];
  totalPositionsCount: number;
  activePositionsCount: number;
}

const initialState: PositionsState = {
  totalPositionValue: 0,
  totalUnrealizedPnl: 0,
  lastUpdated: '',
  activePositions: [],
  inactivePositions: [],
  totalPositionsCount: 0,
  activePositionsCount: 0,
};

const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    updatePositions: (state, action: PayloadAction<PositionsEvent>) => {
      const {
        totalPositionValue,
        totalUnrealizedPnl,
        timestamp,
        activePositions,
        inactivePositions,
        totalPositionsCount,
        activePositionsCount,
      } = action.payload;

      state.totalPositionValue = totalPositionValue;
      state.totalUnrealizedPnl = totalUnrealizedPnl;
      state.lastUpdated = timestamp;
      state.activePositions = activePositions;
      state.inactivePositions = inactivePositions;
      state.totalPositionsCount = totalPositionsCount;
      state.activePositionsCount = activePositionsCount;
    },
    clearPositions: (state) => {
      return initialState;
    },
  },
});

export const { updatePositions, clearPositions } = positionsSlice.actions;
export default positionsSlice.reducer; 