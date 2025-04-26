export interface Token {
  symbol: string;
  balance: number;
  price?: number;
  value?: number;
  logo?: string;
}

export interface Portfolio {
  totalValue: number;
  tokens: Token[];
  lastUpdated?: Date;
}

export interface WalletBalance {
  address: string;
  portfolio: Portfolio;
}

// Zerion API 응답 타입
export interface ZerionPosition {
  type: string;
  id: string;
  attributes: {
    symbol: string;
    quantity: string;
    price?: {
      value: number;
      changed_at: number;
    };
    value?: {
      value: number;
    };
    chain_id: string;
    name: string;
    decimals: number;
  };
}

// API 응답 타입
export interface TokenBalance {
  token_address: string;
  symbol: string;
  balance: string;  // Wei 단위의 잔액
  decimals: number;
}

export interface TokenPrice {
  symbol: string;
  usd: number;
  krw: number;
  change_24h: number;
} 