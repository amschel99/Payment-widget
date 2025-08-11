export interface InvoiceData {
  chain: string;
  token: string;
  amount: number;
  address: string;
}

// Simple types for the payment widget
export type SupportedChain = 'POLYGON' | 'ETHEREUM' | 'BASE' | 'ARBITRUM' | 'OPTIMISM';
export type SupportedToken = 'USDC' | 'USDT' | 'ETH' | 'MATIC';