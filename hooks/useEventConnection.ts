import { useEffect, useRef } from 'react';
import { initializeEventListeners, disconnectEventListeners, isEventListenerActive } from '@/services/redux/eventMiddleware';

/**
 * Hook to manage event connection based on authentication state
 * 
 * This hook:
 * 1. Connects to SSE when user becomes authenticated
 * 2. Disconnects when user logs out
 * 3. Handles reconnection if connection is lost
 * 
 * @param isAuthenticated Whether the user is authenticated
 */
export function useEventConnection(isAuthenticated: boolean): void {
  const initialized = useRef(false);
  
  useEffect(() => {
    let isActive = false;
    let connectionCheckInterval: NodeJS.Timeout | null = null;
    
    const setupEvents = async () => {
      if (isAuthenticated && !isActive) {
        console.log('Initializing event listeners after authentication');
        const success = await initializeEventListeners();
        isActive = success;
        
        if (!success) {
          console.error('Failed to initialize event listeners');
        } else {
          connectionCheckInterval = setInterval(() => {
            if (!isEventListenerActive() && isAuthenticated) {
              console.log('Connection lost, attempting to reconnect...');
              initializeEventListeners();
            }
          }, 30000); // Check every 30 seconds
        }
      }
    };
    
    // Only run once per authenticated session to avoid duplicated connections
    if (isAuthenticated && !initialized.current) {
      setupEvents();
      initialized.current = true;
    } else if (!isAuthenticated && initialized.current) {
      // Reset when logging out
      initialized.current = false;
    }
    
    // Cleanup function to disconnect when auth state changes/component unmount
    return () => {
      if (isActive) {
        console.log('Disconnecting event listeners');
        disconnectEventListeners();
        isActive = false;
      }
      
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
      }
    };
  }, [isAuthenticated]);
} 