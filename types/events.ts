export type EventType = 'ping' | 'heartbeat' | 'positions' | 'equity' | 'market_data' | 'risk_report' | 'jobs';

export interface EventData {
  type: EventType;
  data: any;
}

export interface Position {
  venue: string;
  symbol: string;
  side: string;
  size: {
    quantity: number;
    value: number;
  };
  prices: {
    entry: number;
    mark: number;
    liquidation: number;
  };
  pnl: {
    unrealized: number;
    current: number;
    cumulative: number;
  };
  leverage: number;
}

export interface PositionsEvent {
  summary: {
    totalPositionValue: number;
    totalUnrealizedPnl: number;
    totalPositionsCount: number;
    activePositionsCount: number;
    lastUpdate: string;
  };
  activePositions: Position[];
  inactivePositions: Position[];
}

export interface VenueEquity {
  venue: string;
  balances: {
    wallet: number;
    available: number;
    bnb: number | null;
  };
  totalUnrealizedPnl: number;
}

export interface EquityEvent {
  summary: {
    totalWalletBalance: number;
    totalAvailableBalance: number;
    totalUnrealizedPnl: number;
    totalBnbBalance: number;
    lastUpdate: string;
  };
  venueEquities: VenueEquity[];
} 