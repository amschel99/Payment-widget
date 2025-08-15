import { polygon, base, arbitrum, bsc } from 'viem/chains'
import type { Chain } from 'viem'

export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
  name: string;
}

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
  tokens: Record<string, TokenConfig>;
}

// USDC contract addresses (all native USDC from Circle)
export const POLYGON_USDC: TokenConfig = {
  symbol: 'USDC',
  address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  decimals: 6,
  name: 'USD Coin'
};

export const BASE_USDC: TokenConfig = {
  symbol: 'USDC',
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  decimals: 6,
  name: 'USD Coin'
};

export const ARBITRUM_USDC: TokenConfig = {
  symbol: 'USDC',
  address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  decimals: 6,
  name: 'USD Coin'
};

export const BSC_USDC: TokenConfig = {
  symbol: 'USDC',
  address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  decimals: 18,
  name: 'Binance-Peg USD Coin'
};

// Chain configurations mapped by chain name
export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  POLYGON: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://polygon-rpc.com/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'PolygonScan',
        url: 'https://polygonscan.com',
      },
    },
    tokens: {
      USDC: POLYGON_USDC,
    },
  },
  BASE: {
    id: 8453,
    name: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://mainnet.base.org/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://basescan.org',
      },
    },
    tokens: {
      USDC: BASE_USDC,
    },
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://arb1.arbitrum.io/rpc/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Arbiscan',
        url: 'https://arbiscan.io',
      },
    },
    tokens: {
      USDC: ARBITRUM_USDC,
    },
  },
  BSC: {
    id: 56,
    name: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://bsc-dataseed1.binance.org/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'BscScan',
        url: 'https://bscscan.com',
      },
    },
    tokens: {
      USDC: BSC_USDC,
    },
  },
};

// Helper functions
export function getChainConfig(chainName: string): ChainConfig | null {
  return CHAIN_CONFIGS[chainName.toUpperCase()] || null;
}

export function getTokenConfig(chainName: string, tokenSymbol: string): TokenConfig | null {
  const chainConfig = getChainConfig(chainName);
  if (!chainConfig) return null;
  
  return chainConfig.tokens[tokenSymbol.toUpperCase()] || null;
}

export function isNativeToken(chainName: string, tokenSymbol: string): boolean {
  const chainConfig = getChainConfig(chainName);
  if (!chainConfig) return false;
  
  return chainConfig.nativeCurrency.symbol.toUpperCase() === tokenSymbol.toUpperCase();
}

// Supported chains for wagmi
export const supportedChains: readonly [Chain, ...Chain[]] = [polygon, base, arbitrum, bsc];

// All available chains as options for user selection
export const AVAILABLE_CHAINS = [
  { key: 'POLYGON', name: 'Polygon', icon: '⬠' },
  { key: 'BASE', name: 'Base', icon: '🔵' },
  { key: 'ARBITRUM', name: 'Arbitrum One', icon: '🔷' },
  { key: 'BSC', name: 'BSC', icon: '🟡' },
] as const;