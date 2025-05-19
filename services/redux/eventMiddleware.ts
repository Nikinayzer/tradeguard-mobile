import { Middleware } from 'redux';
import eventService from '@/services/api/events';
import { EventData, Position, PositionsEvent, EquityEvent, VenueEquity } from '@/types/events';
import { updatePositions } from './slices/positionsSlice';
import { updateEquity } from './slices/equitySlice';
import { setMarketData } from './slices/marketDataSlice';
import { createNormalizer } from '@/utils/normalizeData';
import { setConnected, setError } from './slices/connectionSlice';

const normalizePosition = createNormalizer<Position>({
  user_id: 0,
  venue: '',
  symbol: '',
  side: '',
  qty: 0,
  usdt_amt: 0,
  entry_price: 0,
  mark_price: 0,
  liquidation_price: null,
  unrealized_pnl: 0,
  cur_realized_pnl: null,
  cum_realized_pnl: null,
  leverage: 0,
  account_name: null,
  update_type: null,
  timestamp: ''
}, 'camel');

const normalizeVenueEquity = createNormalizer<VenueEquity>({
  userId: 0,
  venue: '',
  timestamp: '',
  walletBalance: 0,
  availableBalance: 0,
  totalUnrealizedPnl: 0,
  bnbBalanceUsdt: 0
}, 'camel');

const normalizePositionsEvent = createNormalizer<PositionsEvent>({
  userId: 0,
  totalPositionValue: 0,
  totalUnrealizedPnl: 0,
  timestamp: '',
  activePositions: [],
  inactivePositions: [],
  totalPositionsCount: 0,
  activePositionsCount: 0
}, 'camel');

const normalizeEquityEvent = createNormalizer<EquityEvent>({
  userId: 0,
  totalWalletBalance: 0,
  totalAvailableBalance: 0,
  totalUnrealizedPnl: 0,
  totalBnbBalanceUsdt: 0,
  timestamp: '',
  venueEquities: []
}, 'camel');

export const EVENT_ACTIONS = {
  CONNECT: 'events/connect',
  DISCONNECT: 'events/disconnect',
  RECONNECT: 'events/reconnect'
} as const;

type EventAction = {
    type: typeof EVENT_ACTIONS[keyof typeof EVENT_ACTIONS];
};

/**
 * Redux middleware for SSE events
 * Processes events and dispatches them to Redux
 */
export const eventMiddleware: Middleware = ({ dispatch }) => {
    // Set up the message handler once when middleware is created
    eventService.setMessageHandler((event: EventData) => {
        try {
            switch (event.type) {
                case 'ping':
                    if (event.data.connected) {
                        dispatch(setConnected(true));
                    } else {
                        dispatch(setError(event.data.error || 'Connection lost'));
                    }
                    break;
                case 'positions':
                    const positionsData = normalizePositionsEvent(event.data);
                    positionsData.activePositions = positionsData.activePositions.map(normalizePosition);
                    positionsData.inactivePositions = positionsData.inactivePositions.map(normalizePosition);
                    dispatch(updatePositions(positionsData));
                    break;
                case 'equity':
                    const equityData = normalizeEquityEvent(event.data);
                    equityData.venueEquities = equityData.venueEquities.map(normalizeVenueEquity);
                    dispatch(updateEquity(equityData));
                    break;
                case 'market_data':
                    dispatch(setMarketData(event.data));
                    break;
            }
        } catch (error) {
            console.error('Error processing event:', error);
            dispatch(setError('Error processing event data'));
        }
    });

    return next => (action: unknown) => {
        if (typeof action === 'object' && action !== null && 'type' in action) {
            const eventAction = action as EventAction;
            
            switch (eventAction.type) {
                case EVENT_ACTIONS.CONNECT:
                    if (!eventService.isActive()) {
                        eventService.connect();
                    }
                    break;
                case EVENT_ACTIONS.DISCONNECT:
                    if (eventService.isActive()) {
                        eventService.disconnect();
                        dispatch(setConnected(false));
                    }
                    break;
                case EVENT_ACTIONS.RECONNECT:
                    eventService.disconnect();
                    eventService.connect();
                    break;
    }
  }
  
  return next(action);
};
};
