import { polygon } from 'viem/chains'
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

// Polygon USDC contract address (correct address)
export const POLYGON_USDC: TokenConfig = {
  symbol: 'USDC',
  address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  decimals: 6,
  name: 'USD Coin'
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
export const supportedChains: readonly [Chain, ...Chain[]] = [polygon];