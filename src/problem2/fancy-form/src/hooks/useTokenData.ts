// src/problem2/fancy-form/src/hooks/useTokenData.ts
// Custom hooks for fetching token data with React Query

import { useQuery } from "@tanstack/react-query";
import { fetchTokenList, fetchTokenPrices } from "../services/tokenService";
import type { Token, PriceData } from "../types";

/**
 * Hook to fetch the list of available tokens
 * Includes automatic refetching on mount and window focus
 */
export const useTokenList = () => {
  return useQuery<Token[], Error>({
    queryKey: ["tokens"],
    queryFn: fetchTokenList,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch current token prices
 * Updates more frequently than token list
 */
export const useTokenPrices = () => {
  return useQuery<PriceData, Error>({
    queryKey: ["prices"],
    queryFn: fetchTokenPrices,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 60 * 1000, // Keep in cache for 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  });
};

/**
 * Hook to fetch user token balances
 * @param address - User wallet address
 */
export const useTokenBalances = (address?: string) => {
  return useQuery({
    queryKey: ["balances", address],
    queryFn: async () => {
      // Mock implementation - in real app, fetch from blockchain
      if (!address) return {};

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ETH: "10.5",
        USDC: "5000",
        WBTC: "0.25",
        DAI: "2000",
      };
    },
    enabled: !!address,
    staleTime: 10 * 1000,
    gcTime: 30 * 1000,
  });
};

/**
 * Hook to fetch swap quote
 * @param fromToken - Source token symbol
 * @param toToken - Target token symbol
 * @param amount - Amount to swap
 */
export const useSwapQuote = (
  fromToken: string,
  toToken: string,
  amount: string
) => {
  return useQuery({
    queryKey: ["swapQuote", fromToken, toToken, amount],
    queryFn: async () => {
      // Mock implementation
      if (!fromToken || !toToken || !amount || Number(amount) <= 0) {
        return null;
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockRate = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
      const outputAmount = Number(amount) * mockRate;
      const priceImpact = Math.random() * 2; // 0-2% impact
      const gasEstimate = "$" + (Math.random() * 5 + 1).toFixed(2);

      return {
        inputAmount: amount,
        outputAmount: outputAmount.toString(),
        exchangeRate: mockRate,
        priceImpact,
        gasEstimate,
        route: [`${fromToken} → ${toToken}`],
      };
    },
    enabled: !!fromToken && !!toToken && !!amount && Number(amount) > 0,
    staleTime: 10 * 1000, // Quote valid for 10 seconds
    gcTime: 30 * 1000,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  });
};

/**
 * Hook to track transaction status
 * @param txHash - Transaction hash to track
 */
export const useTransactionStatus = (txHash?: string) => {
  return useQuery({
    queryKey: ["txStatus", txHash],
    queryFn: async () => {
      if (!txHash) return null;

      // Mock implementation - in real app, check blockchain
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        status: "success" as const,
        confirmations: 12,
        gasUsed: "150000",
        effectiveGasPrice: "30",
      };
    },
    enabled: !!txHash,
    refetchInterval: (query) => {
      // Stop polling once transaction is confirmed
      const data = query.state.data;
      if (data?.status === "success" || data?.status === "failed") {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
};
