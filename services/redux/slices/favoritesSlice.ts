import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@favorites';

interface FavoritesState {
  items: string[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.items.indexOf(action.payload);
      if (index === -1) {
        state.items.push(action.payload);
      } else {
        state.items.splice(index, 1);
      }
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const { toggleFavorite, setFavorites, clearFavorites } = favoritesSlice.actions;

export const selectFavorites = (state: RootState) => state.favorites.items;
export const selectIsFavorite = (symbol: string) => (state: RootState) => 
    state.favorites.items.includes(symbol);

// Persistence middleware
export const persistFavorites = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  if (action.type.startsWith('favorites/')) {
    const state = store.getState();
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favorites.items));
  }
  
  return result;
};

export const loadPersistedFavorites = async (dispatch: any) => {
  try {
    const persistedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (persistedFavorites) {
      dispatch(setFavorites(JSON.parse(persistedFavorites)));
    }
  } catch (error) {
    console.error('Failed to load persisted favorites:', error);
  }
};

export default favoritesSlice.reducer; 