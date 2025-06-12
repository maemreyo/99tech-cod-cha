import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sanitizeNumericInput } from "../utils/formatters";
import type { SwapFormData } from "../types";

/**
 * Create a validation schema for the swap form
 * @param tokenBalances - Current token balances
 * @returns Zod schema for form validation
 */
export const createSwapSchema = (tokenBalances: Record<string, number>) => {
  return (
    z
      .object({
        fromToken: z.string().min(1, "Please select a token to swap from"),
        toToken: z.string().min(1, "Please select a token to swap to"),
        fromAmount: z
          .string()
          .min(1, "Please enter an amount")
          .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "Amount must be a positive number",
          }),
      })
      // First validate that tokens are different
      .refine((data) => data.fromToken !== data.toToken, {
        message: "Cannot swap to the same token",
        path: ["toToken"],
      })
      // Then validate the balance
      .refine(
        (data) => {
          // Skip validation if no token is selected or amount is invalid
          if (
            !data.fromToken ||
            !data.fromAmount ||
            isNaN(Number(data.fromAmount))
          ) {
            return true;
          }

          const amount = Number(data.fromAmount);
          const balance = tokenBalances[data.fromToken] || 0;
          return amount <= balance;
        },
        {
          message: "Insufficient balance",
          path: ["fromAmount"],
        }
      )
  );
};

/**
 * Custom hook for swap form logic
 * @param tokenBalances - Current token balances
 * @returns Form methods and handlers
 */
export const useSwapForm = (tokenBalances: Record<string, number>) => {
  // Dynamic validation schema based on current balances
  const swapSchema = useMemo(
    () => createSwapSchema(tokenBalances),
    [tokenBalances]
  );

  // Form setup with optimized validation
  const formMethods = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    mode: "onChange",
    defaultValues: {
      fromToken: "",
      toToken: "",
      fromAmount: "",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = formMethods;

  const fromToken = watch("fromToken");
  const toToken = watch("toToken");
  const fromAmount = watch("fromAmount");

  // Handle amount input change with validation
  const handleAmountChange = useCallback(
    async (value: string, onChange: (value: string) => void) => {
      const sanitizedValue = sanitizeNumericInput(value);
      onChange(sanitizedValue);

      // Trigger validation after a short delay to prevent excessive validation
      setTimeout(() => {
        trigger("fromAmount");
      }, 100);
    },
    [trigger]
  );

  // Handle token swap button
  const handleSwapTokens = useCallback(
    (toAmount: string) => {
      if (!fromToken || !toToken) return;

      setValue("fromToken", toToken, { shouldValidate: false });
      setValue("toToken", fromToken, { shouldValidate: false });
      setValue("fromAmount", toAmount, { shouldValidate: true });
    },
    [fromToken, toToken, setValue]
  );

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    if (fromToken && tokenBalances[fromToken]) {
      const maxAmount = tokenBalances[fromToken].toFixed(6);
      setValue("fromAmount", maxAmount, { shouldValidate: true });
    }
  }, [fromToken, tokenBalances, setValue]);

  // Check if form is ready for submission
  const isFormValid = useMemo(() => {
    return !!(
      fromToken &&
      toToken &&
      fromAmount &&
      !isNaN(Number(fromAmount)) &&
      Number(fromAmount) > 0 &&
      fromToken !== toToken &&
      tokenBalances[fromToken] >= Number(fromAmount)
    );
  }, [fromToken, toToken, fromAmount, tokenBalances]);

  return {
    formMethods,
    control,
    handleSubmit,
    errors,
    reset,
    fromToken,
    toToken,
    fromAmount,
    handleAmountChange,
    handleSwapTokens,
    handleMaxClick,
    isFormValid,
    trigger,
  };
};

export default useSwapForm;
