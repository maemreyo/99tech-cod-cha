import axios from 'axios';
import type { Token, TokenPrice, PriceData } from '../types';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
const ICONS_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

// Cache for token metadata to avoid repeated fetches
const tokenMetadataCache = new Map<string, Token>();

/**
 * Fetch list of available tokens
 * Since we don't have a direct token list API, we'll derive it from prices
 */
export const fetchTokenList = async (): Promise<Token[]> => {
  try {
    // Fetch prices to get list of available tokens
    const response = await axios.get<TokenPrice[]>(PRICES_API_URL);
    const prices = response.data;

    // Extract unique tokens from price data
    const tokenMap = new Map<string, Token>();
    
    prices.forEach((priceData) => {
      if (!tokenMap.has(priceData.currency)) {
        const token: Token = {
          symbol: priceData.currency,
          name: getTokenName(priceData.currency), // Mock name mapping
          logoURI: `${ICONS_BASE_URL}/${priceData.currency}.svg`,
        };
        tokenMap.set(priceData.currency, token);
        tokenMetadataCache.set(priceData.currency, token);
      }
    });

    // Convert to array and sort alphabetically
    const tokens = Array.from(tokenMap.values()).sort((a, b) => 
      a.symbol.localeCompare(b.symbol)
    );

    return tokens;
  } catch (error) {
    console.error('Failed to fetch token list:', error);
    // Return some default tokens on error
    return getDefaultTokens();
  }
};

/**
 * Fetch current token prices
 */
export const fetchTokenPrices = async (): Promise<PriceData> => {
  try {
    const response = await axios.get<TokenPrice[]>(PRICES_API_URL);
    const prices = response.data;

    // Process price data to get the latest price for each token
    const priceMap: PriceData = {};
    
    // Group by currency and get the latest price
    const latestPrices = prices.reduce((acc, price) => {
      const existing = acc[price.currency];
      if (!existing || new Date(price.date) > new Date(existing.date)) {
        acc[price.currency] = price;
      }
      return acc;
    }, {} as Record<string, TokenPrice>);

    // Convert to simple price map
    Object.entries(latestPrices).forEach(([symbol, data]) => {
      priceMap[symbol] = data.price;
    });

    return priceMap;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    throw new Error('Unable to fetch current prices. Please try again.');
  }
};

/**
 * Fetch detailed token metadata
 * In a real app, this would fetch from a token registry
 */
export const fetchTokenMetadata = async (symbol: string): Promise<Token | null> => {
  // Check cache first
  if (tokenMetadataCache.has(symbol)) {
    return tokenMetadataCache.get(symbol)!;
  }

  try {
    // In a real app, fetch from token registry API
    // For now, return mock data
    const token: Token = {
      symbol,
      name: getTokenName(symbol),
      logoURI: `${ICONS_BASE_URL}/${symbol}.svg`,
      decimals: 18, // Most tokens use 18 decimals
    };

    tokenMetadataCache.set(symbol, token);
    return token;
  } catch (error) {
    console.error(`Failed to fetch metadata for ${symbol}:`, error);
    return null;
  }
};

/**
 * Validate token icon URL
 */
export const validateTokenIcon = async (symbol: string): Promise<boolean> => {
  try {
    const response = await axios.head(`${ICONS_BASE_URL}/${symbol}.svg`);
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * Get mock token name based on symbol
 * In a real app, this would come from token metadata
 */
const getTokenName = (symbol: string): string => {
  const nameMap: Record<string, string> = {
    'ETH': 'Ethereum',
    'WBTC': 'Wrapped Bitcoin',
    'USDC': 'USD Coin',
    'USDT': 'Tether USD',
    'DAI': 'Dai Stablecoin',
    'BUSD': 'Binance USD',
    'ATOM': 'Cosmos Hub',
    'OSMO': 'Osmosis',
    'LUNA': 'Terra Luna',
    'SWTH': 'Switcheo Token',
    'BLUR': 'Blur',
    'bNEO': 'Binance NEO',
    'GMX': 'GMX',
    'STEVMOS': 'Staked EVMOS',
    'RATOM': 'Staked ATOM',
    'STRD': 'Stride',
    'EVMOS': 'Evmos',
    'IRIS': 'IRISnet',
    'IBCX': 'IBC Index',
    'KUJI': 'Kujira',
    'STOSMO': 'Staked OSMO',
    'STATOM': 'Staked ATOM',
    'STLUNA': 'Staked LUNA',
    'LSI': 'LSI Token',
    'OKB': 'OKB',
    'OKT': 'OKT',
    'USC': 'USC Stablecoin',
    'wstETH': 'Wrapped stETH',
    'YieldUSD': 'Yield USD',
    'ZIL': 'Zilliqa',
  };

  return nameMap[symbol] || symbol;
};

/**
 * Get default tokens for fallback
 */
const getDefaultTokens = (): Token[] => {
  const defaultSymbols = ['ETH', 'USDC', 'WBTC', 'DAI', 'USDT'];
  return defaultSymbols.map(symbol => ({
    symbol,
    name: getTokenName(symbol),
    logoURI: `${ICONS_BASE_URL}/${symbol}.svg`,
  }));
};

/**
 * Calculate price impact based on trade size
 * In a real app, this would consider liquidity pools
 */
export const calculatePriceImpact = (
  amount: number,
  fromPrice: number,
  toPrice: number
): number => {
  // Mock calculation - larger trades have higher impact
  const tradeValue = amount * fromPrice;
  const baseImpact = 0.05; // 0.05% base fee
  const sizeImpact = Math.min(tradeValue / 100000, 0.05); // Up to 5% for large trades
  
  return (baseImpact + sizeImpact) * 100; // Return as percentage
};