import { PrecisionHandler } from "../utils/precisionHandler";
import type { UseFormTrigger, UseFormSetValue } from "react-hook-form";
import type { SwapFormData } from "../types";
import { sanitizeNumericInput } from "../utils/formatters";

/**
 * Handle amount input change with sanitization
 */
export const createAmountChangeHandler = (
  trigger: UseFormTrigger<SwapFormData>
) => {
  return async (value: string, onChange: (value: string) => void) => {
    const sanitizedValue = sanitizeNumericInput(value);
    onChange(sanitizedValue);

    setTimeout(() => trigger("fromAmount"), 100);
  };
};

/**
 * Handle token swap (flip from/to tokens)
 */
export const createSwapTokensHandler = (
  fromToken: string,
  toToken: string,
  setValue: UseFormSetValue<SwapFormData>
) => {
  return (toAmount: string) => {
    if (!fromToken || !toToken) return;

    setValue("fromToken", toToken, { shouldValidate: false });
    setValue("toToken", fromToken, { shouldValidate: false });
    setValue("fromAmount", toAmount, { shouldValidate: true });
  };
};

/**
 * Handle MAX button click
 */
export const createMaxClickHandler = (
  fromToken: string,
  tokenBalances: Record<string, number>,
  setValue: UseFormSetValue<SwapFormData>,
  trigger: UseFormTrigger<SwapFormData>
) => {
  return async () => {
    if (fromToken && tokenBalances[fromToken]) {
      const balance = tokenBalances[fromToken];
      const maxAmount = PrecisionHandler.formatMaxAmount(balance);
      
      // Set value without immediate validation
      setValue("fromAmount", maxAmount, { shouldValidate: false });
      
      // Use double RAF for better timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trigger("fromAmount");
        });
      });
    }
  };
};

/**
 * Check if form is valid
 */
export const isFormValid = (
  fromToken: string,
  toToken: string,
  fromAmount: string,
  tokenBalances: Record<string, number>
): boolean => {
  if (!fromToken || !toToken || !fromAmount) return false;
  if (fromToken === toToken) return false;
  
  const amount = PrecisionHandler.parseNumber(fromAmount);
  if (amount <= 0) return false;
  
  const balance = tokenBalances[fromToken] || 0;
  return PrecisionHandler.isAmountValid(fromAmount, balance);
};