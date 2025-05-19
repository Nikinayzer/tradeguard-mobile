import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface ConnectionState {
  isConnected: boolean;
  lastError: string | null;
  isInitialized: boolean;
}

const initialState: ConnectionState = {
  isConnected: false,
  lastError: null,
  isInitialized: false,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.isInitialized = true;
      if (action.payload) {
        state.lastError = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload;
      state.isConnected = false;
      state.isInitialized = true;
    },
    resetConnection: (state) => {
      return initialState;
    },
  },
});

export const { setConnected, setError, resetConnection } = connectionSlice.actions;

// Selectors
export const selectIsConnected = (state: RootState) => state.connection.isConnected;
export const selectLastError = (state: RootState) => state.connection.lastError;
export const selectIsInitialized = (state: RootState) => state.connection.isInitialized;

export default connectionSlice.reducer; 