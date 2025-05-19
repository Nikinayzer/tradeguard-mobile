import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch } from 'react-redux';
import { EVENT_ACTIONS } from '@/services/redux/eventMiddleware';

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const BACKGROUND_TIMEOUT = 30000;

/**
 * Hook to manage event connection based on authentication state and app lifecycle
 * 
 * This hook:
 * 1. Connects to SSE when user becomes authenticated
 * 2. Disconnects when user logs out
 * 3. Handles app state changes (background/foreground)
 * 4. Implements exponential backoff for reconnection attempts
 * 5. Implements background timeout before disconnecting
 * 
 * @param isAuthenticated Whether the user is authenticated
 */
export function useEventConnection(isAuthenticated: boolean): void {
  const dispatch = useDispatch();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const lastAppStateRef = useRef<AppStateStatus>('active');

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
        backgroundTimeoutRef.current = null;
      }

      if (nextAppState === 'active') {
        if (lastAppStateRef.current === 'background' && isAuthenticated) {
          currentDelayRef.current = INITIAL_RECONNECT_DELAY;
          dispatch({ type: EVENT_ACTIONS.RECONNECT });
        }
      } else if (nextAppState === 'background') {
        if (isAuthenticated) {
          // Set a timeout before disconnecting
          backgroundTimeoutRef.current = setTimeout(() => {
            dispatch({ type: EVENT_ACTIONS.DISCONNECT });
          }, BACKGROUND_TIMEOUT);
        }
      }

      lastAppStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
      }
    };
  }, [dispatch, isAuthenticated]);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Reset delay when authentication state changes
      currentDelayRef.current = INITIAL_RECONNECT_DELAY;

      // Connect to SSE
      dispatch({ type: EVENT_ACTIONS.CONNECT });
    } else {
      // Disconnect when not authenticated
      dispatch({ type: EVENT_ACTIONS.DISCONNECT });
    }
  }, [dispatch, isAuthenticated]);

  // Handle reconnection logic with exponential backoff
  const handleReconnect = () => {
    if (!isAuthenticated) return;

    console.log(`Attempting to reconnect in ${currentDelayRef.current}ms...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      dispatch({ type: EVENT_ACTIONS.RECONNECT });
      
      // Increase delay for next attempt (exponential backoff)
      currentDelayRef.current = Math.min(
        currentDelayRef.current * 1.5,
        MAX_RECONNECT_DELAY
      );
    }, currentDelayRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
      }
      dispatch({ type: EVENT_ACTIONS.DISCONNECT });
    };
  }, [dispatch]);

  // Export reconnection handler for use in error cases
  useEffect(() => {
    (window as any).handleSSEReconnect = handleReconnect;
    return () => {
      delete (window as any).handleSSEReconnect;
    };
  }, []);
} 