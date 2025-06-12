import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Select, Input, Button, Tooltip, Modal } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { useTokenPrices, useTokenList } from "../hooks/useTokenData";
import { swapTokens } from "../services/swapService";
import {
  formatNumber,
  calculateExchangeAmount,
  sanitizeNumericInput,
} from "../utils/formatters";
import TokenSelector from "./TokenSelector";
import type { Token, SwapFormData } from "../types";

const createSwapSchema = (tokenBalances: Record<string, number>) => {
  // Create a schema for the entire form
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

// Custom hook for debounced calculations
const useDebounced = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized calculation hook
const useSwapCalculations = (
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

const SwapForm: React.FC = () => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSwapData, setPendingSwapData] = useState<SwapFormData | null>(
    null
  );
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(
    {}
  );

  const { data: tokens, isLoading: tokensLoading } = useTokenList();
  const { data: prices, isLoading: pricesLoading } = useTokenPrices();

  // Dynamic validation schema based on current balances
  const swapSchema = useMemo(
    () => createSwapSchema(tokenBalances),
    [tokenBalances]
  );

  // Form setup with optimized validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    mode: "onChange",
    defaultValues: {
      fromToken: "",
      toToken: "",
      fromAmount: "",
    },
  });

  const fromToken = watch("fromToken");
  const toToken = watch("toToken");
  const fromAmount = watch("fromAmount");

  const debouncedFromAmount = useDebounced(fromAmount, 300);

  const { exchangeRate, toAmount, priceImpact } = useSwapCalculations(
    fromToken,
    toToken,
    debouncedFromAmount,
    prices
  );

  useEffect(() => {
    if (
      tokens &&
      tokens.length > 0 &&
      Object.keys(tokenBalances).length === 0
    ) {
      const balances: Record<string, number> = {};
      tokens.forEach((token) => {
        balances[token.symbol] = Math.random() * 1000 + 100;
      });
      setTokenBalances(balances);
    }
  }, [tokens, tokenBalances]);

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

  const handleSwapTokens = useCallback(() => {
    if (!fromToken || !toToken) return;

    setValue("fromToken", toToken, { shouldValidate: false });
    setValue("toToken", fromToken, { shouldValidate: false });
    setValue("fromAmount", toAmount, { shouldValidate: true });
  }, [fromToken, toToken, setValue, toAmount]);

  // Optimized max button handler
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

  const onSubmit = async (data: SwapFormData) => {
    // Double-check balance before submission
    const balance = tokenBalances[data.fromToken] || 0;
    const amount = Number(data.fromAmount);

    if (amount > balance) {
      toast.error("Insufficient balance for this transaction");
      return;
    }

    setPendingSwapData(data);
    setShowConfirmModal(true);
  };

  const executeSwap = async () => {
    if (!pendingSwapData) return;

    setIsSwapping(true);
    setShowConfirmModal(false);

    try {
      const result = await swapTokens({
        ...pendingSwapData,
        toAmount,
        exchangeRate,
      });

      if (result.success) {
        setTokenBalances((prev) => ({
          ...prev,
          [pendingSwapData.fromToken]:
            prev[pendingSwapData.fromToken] -
            Number(pendingSwapData.fromAmount),
          [pendingSwapData.toToken]:
            prev[pendingSwapData.toToken] + Number(toAmount),
        }));

        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <div>
              <div className="font-semibold">Swap Successful!</div>
              <div className="text-sm opacity-90">
                {formatNumber(Number(pendingSwapData.fromAmount))}{" "}
                {pendingSwapData.fromToken} → {formatNumber(Number(toAmount))}{" "}
                {pendingSwapData.toToken}
              </div>
            </div>
          </div>,
          { duration: 5000 }
        );

        reset();
      } else {
        throw new Error(result.error || "Swap failed");
      }
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">Swap Failed</div>
            <div className="text-sm opacity-90">
              {error instanceof Error
                ? error.message
                : "Please try again later"}
            </div>
          </div>
        </div>
      );
    } finally {
      setIsSwapping(false);
      setPendingSwapData(null);
    }
  };

  if (tokensLoading || pricesLoading) {
    return (
      <div className="swap-form-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="swap-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="swap-form-header">
          <h1 className="swap-form-title">Swap Tokens</h1>
          <p className="swap-form-subtitle">
            Trade tokens instantly with the best rates
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* From Token Section */}
          <div className="token-input-section">
            <div className="flex justify-between items-start mb-3">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                From
              </label>
              <Controller
                name="fromToken"
                control={control}
                render={({ field }) => (
                  <TokenSelector
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      // Re-validate amount when token changes
                      setTimeout(() => trigger("fromAmount"), 100);
                    }}
                    tokens={tokens || []}
                    excludeToken={toToken}
                    error={!!errors.fromToken}
                  />
                )}
              />
            </div>

            <Controller
              name="fromAmount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className={`amount-input ${
                    errors.fromAmount ? "input-error" : ""
                  }`}
                  placeholder="0.00"
                  autoComplete="off"
                  type="text"
                  pattern="[0-9]*[.,]?[0-9]*"
                  inputMode="decimal"
                  onChange={(e) =>
                    handleAmountChange(e.target.value, field.onChange)
                  }
                />
              )}
            />

            {fromToken && tokenBalances[fromToken] !== undefined && (
              <div className="balance-display">
                <span>Balance: {formatNumber(tokenBalances[fromToken])}</span>
                <span className="max-button" onClick={handleMaxClick}>
                  MAX
                </span>
              </div>
            )}

            {errors.fromAmount && (
              <div className="error-message">
                <AlertCircle size={12} />
                {errors.fromAmount.message}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <Tooltip title="Swap tokens">
              <button
                type="button"
                className="swap-rotate-button"
                onClick={handleSwapTokens}
                disabled={!fromToken || !toToken}
              >
                <ArrowUpDown size={20} color="white" />
              </button>
            </Tooltip>
          </div>

          {/* To Token Section */}
          <div className="token-input-section">
            <div className="flex justify-between items-start mb-3">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                To (estimated)
              </label>
              <Controller
                name="toToken"
                control={control}
                render={({ field }) => (
                  <TokenSelector
                    value={field.value}
                    onChange={field.onChange}
                    tokens={tokens || []}
                    excludeToken={fromToken}
                    error={!!errors.toToken}
                  />
                )}
              />
            </div>

            <Input
              className="amount-input"
              value={formatNumber(Number(toAmount))}
              placeholder="0.00"
              disabled
            />

            {toToken && tokenBalances[toToken] !== undefined && (
              <div className="balance-display">
                <span>Balance: {formatNumber(tokenBalances[toToken])}</span>
              </div>
            )}

            {errors.toToken && (
              <div className="error-message">
                <AlertCircle size={12} />
                {errors.toToken.message}
              </div>
            )}
          </div>

          {/* Exchange Rate Display */}
          <AnimatePresence>
            {exchangeRate > 0 && (
              <motion.div
                className="exchange-rate"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex justify-between items-center">
                  <span>Exchange Rate</span>
                  <span className="font-medium">
                    1 {fromToken} = {formatNumber(exchangeRate)} {toToken}
                  </span>
                </div>
                {priceImpact > 0.1 && (
                  <div className="flex justify-between items-center mt-2">
                    <span>Price Impact</span>
                    <span
                      className={`font-medium ${
                        priceImpact > 3 ? "text-red-500" : "text-yellow-500"
                      }`}
                    >
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="primary"
            htmlType="submit"
            className={`submit-button ${isSwapping ? "loading" : ""}`}
            disabled={!isFormValid || isSwapping}
            block
            size="large"
          >
            {isSwapping ? (
              <Loader2 className="animate-spin" size={16} />
            ) : isFormValid ? (
              "Swap Tokens"
            ) : !fromToken || !toToken ? (
              "Select tokens"
            ) : !fromAmount ? (
              "Enter an amount"
            ) : Number(fromAmount) <= 0 ? (
              "Enter valid amount"
            ) : tokenBalances[fromToken] < Number(fromAmount) ? (
              "Insufficient balance"
            ) : (
              "Enter an amount"
            )}
          </Button>
        </form>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Swap"
        open={showConfirmModal}
        onOk={executeSwap}
        onCancel={() => setShowConfirmModal(false)}
        confirmLoading={isSwapping}
        okText="Confirm Swap"
        cancelText="Cancel"
      >
        {pendingSwapData && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">
                {formatNumber(Number(pendingSwapData.fromAmount))}{" "}
                {pendingSwapData.fromToken}
              </p>
              <SwapOutlined className="text-2xl my-2" />
              <p className="text-2xl font-semibold mt-2">
                {formatNumber(Number(toAmount))} {pendingSwapData.toToken}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Exchange Rate
                </span>
                <span className="font-medium">
                  1 {pendingSwapData.fromToken} = {formatNumber(exchangeRate)}{" "}
                  {pendingSwapData.toToken}
                </span>
              </div>
              {priceImpact > 0.1 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Price Impact
                  </span>
                  <span
                    className={`font-medium ${
                      priceImpact > 3 ? "text-red-500" : "text-yellow-500"
                    }`}
                  >
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Network Fee
                </span>
                <span className="font-medium">~$0.50</span>
              </div>
            </div>

            {priceImpact > 3 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="inline mr-1" size={14} />
                  High price impact! Consider splitting your trade into smaller
                  amounts.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default SwapForm;
