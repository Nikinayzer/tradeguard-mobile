export type EventType = 'ping' | 'heartbeat' | 'positions' | 'equity' | 'market_data';

export interface EventData {
  type: EventType;
  data: any;
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

export interface Position {
  user_id: number;
  venue: string;
  symbol: string;
  side: string;
  qty: number;
  usdt_amt: number;
  entry_price: number;
  mark_price: number;
  liquidation_price: number | null;
  unrealized_pnl: number;
  cur_realized_pnl: number | null;
  cum_realized_pnl: number | null;
  leverage: number;
  account_name: string | null;
  update_type: string | null;
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

export interface EquityEvent {
  userId: number;
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalUnrealizedPnl: number;
  totalBnbBalanceUsdt: number;
  timestamp: string;
  venueEquities: VenueEquity[];
} 