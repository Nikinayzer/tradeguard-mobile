import { Middleware } from 'redux';
import eventService from '@/services/api/events';
import { EventData, Position, PositionsEvent, EquityEvent, VenueEquity } from '@/types/events';
import { updatePositions } from './slices/positionsSlice';
import { updateEquity } from './slices/equitySlice';
import { setMarketData } from './slices/marketDataSlice';
import { createNormalizer } from '@/utils/normalizeData';
import { setConnected, setError } from './slices/connectionSlice';

const normalizePosition = createNormalizer<Position>({
  venue: '',
  symbol: '',
  side: '',
  size: {
    quantity: 0,
    value: 0
  },
  prices: {
    entry: 0,
    mark: 0,
    liquidation: 0
  },
  pnl: {
    unrealized: 0,
    current: 0,
    cumulative: 0
  },
  leverage: 0
}, 'snake');

const normalizeVenueEquity = createNormalizer<VenueEquity>({
  venue: '',
  balances: {
    wallet: 0,
    available: 0,
    bnb: 0
  },
  totalUnrealizedPnl: 0
}, 'snake');

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
                    const positionsData: PositionsEvent = {
                        summary: {
                            totalPositionValue: event.data.summary?.totalPositionValue || 0,
                            totalUnrealizedPnl: event.data.summary?.totalUnrealizedPnl || 0,
                            totalPositionsCount: event.data.summary?.totalPositionsCount || 0,
                            activePositionsCount: event.data.summary?.activePositionsCount || 0,
                            lastUpdate: event.data.summary?.lastUpdate || new Date().toISOString()
                        },
                        activePositions: (event.data.activePositions || []).map((pos: any) => normalizePosition(pos)),
                        inactivePositions: (event.data.inactivePositions || []).map((pos: any) => normalizePosition(pos))
                    };
                    dispatch(updatePositions(positionsData));
                    break;
                case 'equity':
                    const equityData: EquityEvent = {
                        summary: {
                            totalWalletBalance: event.data.summary?.totalWalletBalance || 0,
                            totalAvailableBalance: event.data.summary?.totalAvailableBalance || 0,
                            totalUnrealizedPnl: event.data.summary?.totalUnrealizedPnl || 0,
                            totalBnbBalance: event.data.summary?.totalBnbBalance || 0,
                            lastUpdate: event.data.summary?.lastUpdate || new Date().toISOString()
                        },
                        venueEquities: (event.data.venueEquities || []).map((venue: any) => normalizeVenueEquity(venue))
                    };
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
