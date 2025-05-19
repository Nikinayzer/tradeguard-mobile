import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectFavorites,
  selectIsFavorite,
  toggleFavorite,
} from '@/services/redux/slices/favoritesSlice';

export function useFavorites() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);

  const isFavorite = useCallback(
    (instrument: string) => useSelector(selectIsFavorite(instrument)),
    []
  );

  const toggleFavoriteInstrument = useCallback(
    (instrument: string) => {
      dispatch(toggleFavorite(instrument));
    },
    [dispatch]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite: toggleFavoriteInstrument,
  };
} 