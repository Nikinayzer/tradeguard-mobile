import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobStateSlice';
import marketDataReducer from './slices/marketDataSlice';
import positionsReducer from './slices/positionsSlice';
import equityReducer from './slices/equitySlice';
import authReducer from './slices/authSlice';
import favoritesReducer from './slices/favoritesSlice';
import { persistFavorites } from './slices/favoritesSlice';
import { eventMiddleware } from './eventMiddleware';
import connectionReducer from './slices/connectionSlice';

export const store = configureStore({
    reducer: {
        job: jobReducer,
        marketData: marketDataReducer,
        positions: positionsReducer,
        equity: equityReducer,
        auth: authReducer,
        favorites: favoritesReducer,
        connection: connectionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(eventMiddleware, persistFavorites),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
