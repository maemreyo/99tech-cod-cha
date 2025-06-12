import { z } from "zod";
import { PrecisionHandler } from "../utils/precisionHandler";

/**
 * Create a validation schema optimized for token swap
 */
export const createSwapSchema = (
  tokenBalances: Record<string, number>,
  tokenDecimals: Record<string, number> = {}
) => {
  return (
    z
      .object({
        fromToken: z.string().min(1, "Please select a token to swap from"),
        toToken: z.string().min(1, "Please select a token to swap to"),
        fromAmount: z
          .string()
          .min(1, "Please enter an amount")
          .refine((val) => !isNaN(PrecisionHandler.parseNumber(val)) && PrecisionHandler.parseNumber(val) > 0, {
            message: "Amount must be a positive number",
          }),
      })
      .refine((data) => data.fromToken !== data.toToken, {
        message: "Cannot swap to the same token",
        path: ["toToken"],
      })
      .refine(
        (data) => {
          if (!data.fromToken || !data.fromAmount) return true;
          
          const balance = tokenBalances[data.fromToken] || 0;
          const decimals = tokenDecimals[data.fromToken] || 18;
          
          // Use token-aware precision validation
          return PrecisionHandler.isAmountValid(data.fromAmount, balance, decimals);
        },
        {
          message: "Insufficient balance",
          path: ["fromAmount"],
        }
      )
  );
};