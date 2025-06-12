import { useMemo } from "react";
import { calculateExchangeAmount } from "../utils/formatters";

/**
 * Hook for calculating swap-related values
 * @param fromToken - Source token symbol
 * @param toToken - Target token symbol
 * @param fromAmount - Amount to swap
 * @param prices - Token price data
 * @returns Calculated exchange rate, output amount, and price impact
 */
export const useSwapCalculations = (
  fromToken: string,
  toToken: string,
  fromAmount: string,
  prices: Record<string, number> | undefined
) => {
  return useMemo(() => {
    if (
      !prices ||
      !fromToken ||
      !toToken ||
      !fromAmount ||
      isNaN(Number(fromAmount))
    ) {
      return { exchangeRate: 0, toAmount: "0", priceImpact: 0 };
    }

    const fromPrice = prices[fromToken] || 0;
    const toPrice = prices[toToken] || 0;
    const rate = fromPrice / toPrice;
    const amount = calculateExchangeAmount(Number(fromAmount), rate);

    // Mock price impact calculation
    const impact = Math.min(Number(fromAmount) * 0.001, 5);

    return {
      exchangeRate: rate,
      toAmount: amount.toString(),
      priceImpact: impact,
    };
  }, [fromToken, toToken, fromAmount, prices]);
};

export default useSwapCalculations;