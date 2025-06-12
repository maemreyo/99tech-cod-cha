import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SwapFormData } from "../types";
import { createSwapSchema } from "../validations/swapFormSchema";
import { 
  createAmountChangeHandler, 
  createSwapTokensHandler, 
  createMaxClickHandler, 
  isFormValid as checkFormValidity 
} from "./swapFormUtils";

/**
 * Enhanced swap form hook with precision handling
 */
export const useSwapForm = (tokenBalances: Record<string, number>) => {
  // Create validation schema
  const swapSchema = useMemo(
    () => createSwapSchema(tokenBalances),
    [tokenBalances]
  );

  // Initialize form with react-hook-form
  const formMethods = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    mode: "onChange",
    defaultValues: {
      fromToken: "",
      toToken: "",
      fromAmount: "",
    },
  });

  // Extract form methods
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = formMethods;

  // Watch form values
  const fromToken = watch("fromToken");
  const toToken = watch("toToken");
  const fromAmount = watch("fromAmount");

  // Create event handlers using utility functions
  const handleAmountChange = useCallback(
    createAmountChangeHandler(trigger),
    [trigger]
  );

  const handleSwapTokens = useCallback(
    createSwapTokensHandler(fromToken, toToken, setValue),
    [fromToken, toToken, setValue]
  );

  const handleMaxClick = useCallback(
    createMaxClickHandler(fromToken, tokenBalances, setValue, trigger),
    [fromToken, tokenBalances, setValue, trigger]
  );

  // Check form validity
  const isFormValid = useMemo(
    () => checkFormValidity(fromToken, toToken, fromAmount, tokenBalances),
    [fromToken, toToken, fromAmount, tokenBalances]
  );

  // Return form state and handlers
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