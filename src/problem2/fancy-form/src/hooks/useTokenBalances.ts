import { useState, useEffect } from "react";
import type { Token } from "../types";

/**
 * Hook for managing token balances
 * @param tokens - List of available tokens
 * @returns Token balances and setter function
 */
export const useTokenBalances = (tokens: Token[] | undefined) => {
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});

  // Initialize token balances with random values
  useEffect(() => {
    if (tokens && tokens.length > 0 && Object.keys(tokenBalances).length === 0) {
      const balances: Record<string, number> = {};
      tokens.forEach((token) => {
        balances[token.symbol] = Math.random() * 1000 + 100;
      });
      setTokenBalances(balances);
    }
  }, [tokens, tokenBalances]);

  // Update balance after a successful swap
  const updateBalances = (fromToken: string, toToken: string, fromAmount: number, toAmount: number) => {
    setTokenBalances((prev) => ({
      ...prev,
      [fromToken]: prev[fromToken] - fromAmount,
      [toToken]: prev[toToken] + toAmount,
    }));
  };

  return { tokenBalances, setTokenBalances, updateBalances };
};

export default useTokenBalances;