import { Middleware, AnyAction } from 'redux';
import eventService, { PositionsEvent, EquityEvent, EventType, PingEvent, VenueEquity, Position } from '@/services/api/events';
import { updatePositions } from './slices/positionsSlice';
import { updateEquity } from './slices/equitySlice';
import { store } from './store';

// Maintain references to unsubscribe functions
let unsubscribeHandlers: Array<() => void> = [];

/**
 * Helper function to safely get property value from event data.
 * Automatically handles snake_case to camelCase conversion.
 * 
 * @param obj The object to extract data from
 * @param camelKey The property name in camelCase format
 * @param defaultValue Optional default value if property is not found
 * @returns The property value or default value
 */
function getValueSafe<T>(obj: any, camelKey: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  // If camelCase version exists, use it
  if (obj[camelKey] !== undefined) {
    return obj[camelKey];
  }
  
  // Convert camelCase to snake_case
  const snakeKey = camelKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  
  // Return the snake_case version or default value
  return obj[snakeKey] !== undefined ? obj[snakeKey] : defaultValue;
}

/**
 * Transform venue equity data to ensure consistent property naming
 */
function transformVenueEquity(venueEquity: any): VenueEquity {
  return {
    userId: getValueSafe(venueEquity, 'userId', 0),
    venue: getValueSafe(venueEquity, 'venue', ''),
    timestamp: getValueSafe(venueEquity, 'timestamp', ''),
    walletBalance: getValueSafe(venueEquity, 'walletBalance', 0),
    availableBalance: getValueSafe(venueEquity, 'availableBalance', 0),
    totalUnrealizedPnl: getValueSafe(venueEquity, 'totalUnrealizedPnl', 0),
    bnbBalanceUsdt: getValueSafe(venueEquity, 'bnbBalanceUsdt', 0)
  };
}

/**
 * Transform position data to ensure consistent property naming
 */
function transformPosition(position: any): Position {
  const result = {
    userId: getValueSafe(position, 'userId', 0),
    venue: getValueSafe(position, 'venue', ''),
    symbol: getValueSafe(position, 'symbol', ''),
    side: getValueSafe(position, 'side', ''),
    qty: getValueSafe(position, 'qty', 0),
    usdtAmt: getValueSafe(position, 'usdtAmt', 0),
    entryPrice: getValueSafe(position, 'entryPrice', 0),
    markPrice: getValueSafe(position, 'markPrice', 0),
    unrealizedPnl: getValueSafe(position, 'unrealizedPnl', 0),
    leverage: getValueSafe(position, 'leverage', 0),
    timestamp: getValueSafe(position, 'timestamp', '')
  } as Position;
  
  // Add cumRealizedPnl for closed positions if available
  const cumRealizedPnl = getValueSafe(position, 'cumRealizedPnl', null);
  if (cumRealizedPnl !== null) {
    (result as any).cumRealizedPnl = cumRealizedPnl;
  }
  
  return result;
}

/**
 * Transform positions event data to ensure consistent property naming
 */
function transformPositionsEvent(data: any): PositionsEvent {
  return {
    ...data,
    activePositions: Array.isArray(data.activePositions) 
      ? data.activePositions.map(transformPosition)
      : [],
    inactivePositions: Array.isArray(data.inactivePositions)
      ? data.inactivePositions.map(transformPosition)
      : []
  };
}

/**
 * Transform equity event data to ensure consistent property naming
 */
function transformEquityEvent(data: any): EquityEvent {
  return {
    ...data,
    venueEquities: Array.isArray(data.venueEquities) 
      ? data.venueEquities.map(transformVenueEquity)
      : []
  };
}

/**
 * Initialize the SSE connection and bind events to Redux actions
 * @returns Promise that resolves to true if connection was successful
 */
export async function initializeEventListeners(): Promise<boolean> {
  // Clean up any existing listeners first
  disconnectEventListeners();
  
  try {
    const connected = await eventService.connect();
    if (!connected) {
      console.error('Failed to initialize event listeners');
      return false;
    }

    // Store unsubscribe handlers to allow for later cleanup
    unsubscribeHandlers = [
      eventService.subscribe<PositionsEvent>('positions', (data: any) => {
        console.log('Dispatching positions update to Redux');
        const transformedData = transformPositionsEvent(data);
        store.dispatch(updatePositions(transformedData));
      }),
      eventService.subscribe<EquityEvent>('equity', (data: any) => {
        console.log('Dispatching equity update to Redux');
        const transformedData = transformEquityEvent(data);
        store.dispatch(updateEquity(transformedData));
      }),

      eventService.subscribe<PingEvent>('ping', (data: PingEvent) => {
        if (data) {
          if (data.message === 'connected' || data.rawData === 'connected' || data.connected === true) {
            console.log('SSE connection confirmed');
          } else {
            console.log('SSE connection status:', data);
          }
        }
      })
    ];
    
    return true;
  } catch (error) {
    console.error('Error initializing event listeners:', error);
    return false;
  }
}

/**
 * Check if the events service is currently active
 */
export function isEventListenerActive(): boolean {
  return eventService.isActive();
}

/**
 * Disconnect the SSE stream and clean up event listeners
 */
export function disconnectEventListeners(): void {
  try {
    unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
    unsubscribeHandlers = [];

    eventService.disconnect();
  } catch (error) {
    console.error('Error disconnecting event listeners:', error);
  }
}

export const EVENT_ACTIONS = {
  CONNECT: 'events/connect',
  DISCONNECT: 'events/disconnect',
  RECONNECT: 'events/reconnect'
};

/**
 * Redux middleware for SSE-related actions
 * This allows components to dispatch actions to control the event stream
 */
export const eventMiddleware: Middleware = ({ dispatch }) => (next) => (action) => {
  if (action && typeof action === 'object' && 'type' in action) {
    if (action.type === EVENT_ACTIONS.CONNECT) {
      initializeEventListeners();
    } else if (action.type === EVENT_ACTIONS.DISCONNECT) {
      disconnectEventListeners();
    } else if (action.type === EVENT_ACTIONS.RECONNECT) {
      disconnectEventListeners();
      initializeEventListeners();
    }
  }
  
  return next(action);
};

/**
 * Debugging utility to check connection status
 * For development and troubleshooting only
 */
export function debugEventStream(): void {
  const debugInfo = eventService.getDebugInfo();
  console.log('SSE Connection Status:', debugInfo);
} 