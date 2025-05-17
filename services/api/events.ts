import { API_ENDPOINTS } from '@/config/api';
import apiClient from './client';
import { secureStorage } from '@/services/storage/secureStorage';
import EventSource, { EventSourceListener } from 'react-native-sse';
import {authService} from "@/services/api/auth";
import {useAuth} from "@/contexts/AuthContext";
// TODO REWRITE BOTH events and middleware
type CustomEvents = 'ping' | 'heartbeat' | 'positions' | 'equity';

export interface PingEvent {
  connected?: boolean;
  message?: string;
  type?: string;
  rawData?: string;
}

export interface HeartbeatEvent {
  timestamp: string;
  type: 'heartbeat';
}

export interface Position {
  userId: number;
  venue: string;
  symbol: string;
  side: string;
  qty: number;
  usdtAmt: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
  timestamp: string;
}

export interface PositionsEvent {
  userId: number;
  totalPositionValue: number;
  totalUnrealizedPnl: number;
  timestamp: string;
  activePositions: Position[];
  inactivePositions: Position[];
  totalPositionsCount: number;
  activePositionsCount: number;
}

export interface VenueEquity {
  userId: number;
  venue: string;
  timestamp: string;
  walletBalance: number;
  availableBalance: number;
  totalUnrealizedPnl: number;
  bnbBalanceUsdt: number;
}

export interface EquityEvent {
  userId: number;
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalUnrealizedPnl: number;
  totalBnbBalanceUsdt: number;
  timestamp: string;
  venueEquities: VenueEquity[];
}

export type EventType = 'ping' | 'heartbeat' | 'positions' | 'equity';

/**
 * Service for handling Server-Sent Events (SSE) from the API
 */
export class EventService {
  private eventSource: EventSource<CustomEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private listeners: Map<EventType, Array<(data: any) => void>> = new Map();
  private isConnected = false;

  constructor() {
    this.listeners.set('ping', []);
    this.listeners.set('heartbeat', []);
    this.listeners.set('positions', []);
    this.listeners.set('equity', []);
  }

  /**
   * Subscribe to a specific event type
   * @param eventType The type of event to subscribe to
   * @param callback Function to call when an event of this type is received
   * @returns Unsubscribe function
   */
  public subscribe<T>(eventType: EventType, callback: (data: T) => void): () => void {
    const eventListeners = this.listeners.get(eventType) || [];
    eventListeners.push(callback as (data: any) => void);
    this.listeners.set(eventType, eventListeners);

    return () => {
      const listeners = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        listeners.filter(listener => listener !== callback)
      );
    };
  }

  /**
   * Check if the service is currently connected
   */
  public isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Connect to the SSE stream
   */
  public async connect(): Promise<boolean> {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      const token = await secureStorage.getToken();
      if (!token) {
        console.error('No token available for SSE connection');
        return false;
      }

      const url = `${apiClient.defaults.baseURL}${API_ENDPOINTS.events.stream}`;

      this.eventSource = new EventSource<CustomEvents>(url, {
        headers: {
          Authorization: {
            toString: function() {
              return `Bearer ${token}`;
            }
          }
        },
        pollingInterval: 5000,
        //debug: __DEV__,
        withCredentials: false
      });

      this.setupEventListeners();
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnect from the SSE stream
   */
  public disconnect(): void {
    this.isConnected = false;
    
    if (this.eventSource) {
      this.eventSource.removeAllEventListeners();
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Setup event listeners for the SSE connection
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Create a universal listener to handle all event types
    const eventListener: EventSourceListener<CustomEvents> = (event) => {
      try {
        if (event.type === 'open') {
          console.log('SSE connection established');
          this.isConnected = true;
          this.reconnectAttempts = 0;
        } else if (event.type === 'error') {
          console.error('SSE connection error:', event.message);
          if (event.xhrStatus === 403) {
            // log out here
          }
          this.isConnected = false;
          this.reconnectAttempts++;
          
          // Let the library handle reconnection via pollingInterval
          if (this.reconnectAttempts > this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached, stopping reconnection');
            this.disconnect();
          }
        } else if (event.type === 'message') {
          // Generic message handler for events without specific type
          if ('data' in event && event.data) {
            // For plain text 'connected' message
            if (typeof event.data === 'string' && event.data.trim() === 'connected') {
              console.log('Received plain text connection confirmation');
              this.notifyListeners('ping', { rawData: event.data, message: event.data } as PingEvent);
              return;
            }

            try {
              const parsedData = JSON.parse(event.data);
              console.log('Message parsed successfully:', typeof parsedData);

              this.processEventByContent(parsedData);
            } catch (err) {
              console.error('Error parsing message data:', err);
              
              // If not valid JSON but a string, pass it through for identification
              if (typeof event.data === 'string') {
                this.processEventByContent(event.data);
              }
            }
          }
        } else {
          // Handle custom event types: ping, heartbeat, positions, equity
          if ('data' in event && event.data) {
            try {
              if (event.type === 'ping') {
                if (typeof event.data === 'string') {
                  if (event.data.trim() === 'connected') {
                    console.log('Ping event - connected');
                    this.notifyListeners('ping', { rawData: event.data, message: event.data } as PingEvent);
                  } else {
                    try {
                      const parsedData = JSON.parse(event.data);
                      this.notifyListeners('ping', parsedData as PingEvent);
                      console.log('Ping event processed: Connection confirmed');
                    } catch (error) {
                      console.log('Ping event with non-JSON data:', event.data);
                      this.notifyListeners('ping', { rawData: event.data, message: event.data } as PingEvent);
                    }
                  }
                }
              } else {
                const parsedData = JSON.parse(event.data);

                switch(event.type) {
                  case 'heartbeat':
                    this.notifyListeners('heartbeat', parsedData as HeartbeatEvent);
                    console.log('Heartbeat event processed at:', new Date().toISOString());
                    break;
                  case 'positions':
                    this.notifyListeners('positions', parsedData as PositionsEvent);
                    console.log('Positions update processed');
                    break;
                  case 'equity':
                    this.notifyListeners('equity', parsedData as EquityEvent);
                    console.log('Equity update processed');
                    break;
                }
              }
            } catch (err) {
              console.error(`Error parsing ${event.type} event data:`, err);
            }
          }
        }
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    };

    this.eventSource.addEventListener('open', eventListener);
    this.eventSource.addEventListener('error', eventListener);
    this.eventSource.addEventListener('message', eventListener);
    this.eventSource.addEventListener('ping', eventListener);
    this.eventSource.addEventListener('heartbeat', eventListener);
    this.eventSource.addEventListener('positions', eventListener);
    this.eventSource.addEventListener('equity', eventListener);
  }
  
  /**
   * Process events by examining their content
   */
  private processEventByContent(parsedEvent: any): void {
    try {
      if (typeof parsedEvent === 'string') {
        this.identifyEventByStructure(parsedEvent);
        return;
      }

      if (parsedEvent && typeof parsedEvent === 'object' && parsedEvent.type) {
        console.log(`Processing event with type: ${parsedEvent.type}`);
        
        switch (parsedEvent.type) {
          case 'ping':
            this.notifyListeners('ping', parsedEvent as PingEvent);
            console.log('Ping event: Connection confirmed');
            break;
          case 'heartbeat':
            this.notifyListeners('heartbeat', parsedEvent as HeartbeatEvent);
            console.log('Heartbeat received at:', parsedEvent.timestamp);
            break;
          default:
            this.identifyEventByStructure(parsedEvent);
        }
      } else {
        this.identifyEventByStructure(parsedEvent);
      }
    } catch (error) {
      console.error('Error processing event by content:', error);
    }
  }
  
  /**
   * Identify event type by examining its structure
   */
  private identifyEventByStructure(parsedEvent: any): void {
    if (typeof parsedEvent === 'string' && parsedEvent.trim() === 'connected') {
      console.log('Identified plain text ping event');
      this.notifyListeners('ping', { message: parsedEvent, rawData: parsedEvent } as PingEvent);
      return;
    }
    
    // Check for positions event structure
    if (parsedEvent.activePositions && Array.isArray(parsedEvent.activePositions)) {
      console.log('Identified as positions event by structure');
      this.notifyListeners('positions', parsedEvent as PositionsEvent);
      if (parsedEvent.totalPositionValue !== undefined) {
        console.log('Positions update received:', 
          `Total: ${parsedEvent.totalPositionValue.toFixed(2)}, ` +
          `PnL: ${parsedEvent.totalUnrealizedPnl?.toFixed(2) || '0.00'}, ` +
          `Active: ${parsedEvent.activePositionsCount || 0}`);
      }
      return;
    }
    
    // Check for equity event structure
    if (parsedEvent.venueEquities && Array.isArray(parsedEvent.venueEquities)) {
      console.log('Identified as equity event by structure');
      this.notifyListeners('equity', parsedEvent as EquityEvent);
      if (parsedEvent.totalWalletBalance !== undefined) {
        console.log('Equity update received:', 
          `Balance: ${parsedEvent.totalWalletBalance.toFixed(2)}, ` +
          `Available: ${parsedEvent.totalAvailableBalance.toFixed(2)}`);
      }
      return;
    }
    
    // Check for heartbeat by timestamp presence
    if (parsedEvent.timestamp && parsedEvent.type === 'heartbeat') {
      console.log('Identified as heartbeat event by structure');
      this.notifyListeners('heartbeat', parsedEvent as HeartbeatEvent);
      console.log('Heartbeat received at:', parsedEvent.timestamp);
      return;
    }
    
    // Check for ping event
    if (parsedEvent.connected !== undefined) {
      console.log('Identified as ping event by structure');
      this.notifyListeners('ping', parsedEvent as PingEvent);
      console.log('Ping event: Connection confirmed');
      return;
    }
    
    console.warn('Received unidentifiable event:', parsedEvent);
  }

  /**
   * Schedule a reconnect with exponential backoff
   * This is a fallback - the library should handle reconnection with pollingInterval
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  /**
   * Notify all listeners of a specific event type
   */
  private notifyListeners(eventType: EventType, data: any): void {
    const listeners = this.listeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventType} event listener:`, error);
      }
    });
  }

  /**
   * Get debug information about the current connection
   * Useful for troubleshooting SSE issues
   */
  public getDebugInfo(): Record<string, any> {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      hasEventSource: this.eventSource !== null,
      listenerCounts: {
        ping: this.listeners.get('ping')?.length || 0,
        heartbeat: this.listeners.get('heartbeat')?.length || 0,
        positions: this.listeners.get('positions')?.length || 0,
        equity: this.listeners.get('equity')?.length || 0,
      }
    };
  }
}

// Create a singleton instance
const _eventService = new EventService();
export default _eventService; 