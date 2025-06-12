export interface Token {
  symbol: string;
  name?: string;
  address?: string;
  decimals?: number;
  logoURI?: string;
}

export interface TokenPrice {
  currency: string;
  price: number;
  date: string;
}

export interface SwapFormData {
  fromToken: string;
  toToken: string;
  fromAmount: string;
}

export interface SwapRequest extends SwapFormData {
  toAmount: string;
  exchangeRate: number;
  slippage?: number;
}

export interface SwapResponse {
  success: boolean;
  txHash?: string;
  error?: string;
  fromAmount?: string;
  toAmount?: string;
  fromToken?: string;
  toToken?: string;
  exchangeRate?: number;
  gasUsed?: string;
  timestamp?: number;
}

export interface PriceData {
  [tokenSymbol: string]: number;
}

export interface Balance {
  token: string;
  amount: string;
  usdValue?: number;
}

export interface TransactionStatus {
  status: "pending" | "success" | "failed";
  txHash?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
