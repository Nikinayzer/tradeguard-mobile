import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobStateSlice';
import marketDataReducer from './slices/marketDataSlice';
import positionsReducer from './slices/positionsSlice';
import equityReducer from './slices/equitySlice';

export const store = configureStore({
    reducer: {
        job: jobReducer,
        marketData: marketDataReducer,
        positions: positionsReducer,
        equity: equityReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
