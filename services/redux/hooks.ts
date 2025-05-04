import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { PositionsState } from './slices/positionsSlice';
import { EquityState } from './slices/equitySlice';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePositions = (): PositionsState => {
  return useAppSelector((state) => state.positions);
};

export const useEquity = (): EquityState => {
  return useAppSelector((state) => state.equity);
};

export const useActivePositions = () => {
  return useAppSelector((state) => state.positions.activePositions);
};

export const useVenueEquities = () => {
  return useAppSelector((state) => state.equity.venueEquities);
}; 