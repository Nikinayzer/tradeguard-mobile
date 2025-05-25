import { API_ENDPOINTS } from '@/config/api';
import apiClient from './client';
import { secureStorage } from '@/services/storage/secureStorage';
import EventSource from 'react-native-sse';
import { EventType, EventData } from '@/types/events';

/**
 * Service for handling Server-Sent Events (SSE) from the API
 * This is a thin wrapper around the SSE connection that only handles
 * connection management and data transport.
 */
export class EventService {
  private eventSource: EventSource<EventType> | null = null;
  private isConnected = false;
  private onMessage: ((event: EventData) => void) | null = null;
  private connectionPromise: Promise<boolean> | null = null;

  /**
   * Set the message handler for SSE events
   */
  public setMessageHandler(handler: (event: EventData) => void): void {
    this.onMessage = handler;
  }

  /**
   * Check if the service is currently connected
   */
  public isActive(): boolean {
    return this.isConnected && this.eventSource !== null;
  }

  /**
   * Connect to the SSE stream
   */
  public async connect(): Promise<boolean> {
    if (this.connectionPromise) return this.connectionPromise;
    if (this.isConnected && this.eventSource) return true;

    this.connectionPromise = (async () => {
    try {
      const token = await secureStorage.getToken();
      if (!token) {
        console.error('No token available for SSE connection');
        return false;
      }

      const url = `${apiClient.defaults.baseURL}${API_ENDPOINTS.events.stream}`;
        console.log('Connecting to SSE at:', url);

        this.eventSource = new EventSource<EventType>(url, {
        headers: {
          Authorization: {
            toString: function() {
              return `Bearer ${token}`;
            }
          }
        },
        pollingInterval: 5000,
        withCredentials: false
      });

      this.setupEventListeners();
        this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
        this.disconnect();
      return false;
      } finally {
        this.connectionPromise = null;
    }
    })();

    return this.connectionPromise;
  }

  /**
   * Disconnect from the SSE stream
   */
  public disconnect(): void {
    this.isConnected = false;
    this.connectionPromise = null;
    
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
    if (!this.eventSource || !this.onMessage) return;

    this.eventSource.addEventListener('open', () => {
          console.log('SSE connection established');
      this.onMessage?.({ type: 'ping', data: { connected: true } });
    });

    this.eventSource.addEventListener('error', (event) => {
      console.error('SSE connection error:', event);
          this.isConnected = false;
      this.onMessage?.({ type: 'ping', data: { connected: false, error: 'Connection error' } });
    });

    // Add listeners for specific event types
    ['ping', 'heartbeat', 'positions', 'equity', 'market_data', 'risk_report', 'jobs'].forEach(type => {
      this.eventSource?.addEventListener(type as EventType, (event) => {
          if ('data' in event && event.data) {
          try {
            // Handle ping event specially since it might be a raw string
            if (type === 'ping' && event.data === 'connected') {
              this.onMessage?.({ type: 'ping', data: { connected: true } });
              return;
            }

              const data = JSON.parse(event.data);
            this.onMessage?.({ type: type as EventType, data });
          } catch (error) {
            console.error(`Error parsing ${type} event data:`, error, 'Raw data:', event.data);
          }
        }
      });
    });
  }
}

// Create a singleton instance
const _eventService = new EventService();
export default _eventService; 