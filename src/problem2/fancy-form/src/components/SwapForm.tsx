import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTokenPrices, useTokenList } from "../hooks/useTokenData";
import { swapTokens } from "../services/swapService";
import { formatNumber } from "../utils/formatters";
import useDebounce from "../hooks/useDebounce";
import useSwapCalculations from "../hooks/useSwapCalculations";
import useTokenBalances from "../hooks/useTokenBalances";
import useSwapForm from "../hooks/useSwapForm";
import FromTokenSection from "./FromTokenSection";
import ToTokenSection from "./ToTokenSection";
import SwapButton from "./SwapButton";
import SwapSummary from "./SwapSummary";
import SubmitButton from "./SubmitButton";
import ConfirmationModal from "./ConfirmationModal";
import type { SwapFormData } from "../types";

const SwapForm: React.FC = () => {
  // UI state
  const [isSwapping, setIsSwapping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSwapData, setPendingSwapData] = useState<SwapFormData | null>(null);

  // Data fetching
  const { data: tokens, isLoading: tokensLoading } = useTokenList();
  const { data: prices, isLoading: pricesLoading } = useTokenPrices();
  
  // Token balances management
  const { tokenBalances, updateBalances } = useTokenBalances(tokens);

  // Form handling
  const {
    control,
    handleSubmit,
    errors,
    reset,
    fromToken,
    toToken,
    fromAmount,
    handleAmountChange,
    handleSwapTokens: swapTokensInForm,
    handleMaxClick,
    isFormValid,
    trigger,
  } = useSwapForm(tokenBalances);

  // Debounce input for calculations
  const debouncedFromAmount = useDebounce(fromAmount, 300);

  // Calculate swap details
  const { exchangeRate, toAmount, priceImpact } = useSwapCalculations(
    fromToken,
    toToken,
    debouncedFromAmount,
    prices
  );

  // Handle swap tokens button click
  const handleSwapTokens = () => {
    swapTokensInForm(toAmount);
  };

  // Form submission handler
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

  // Execute the swap transaction
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
        // Update balances after successful swap
        updateBalances(
          pendingSwapData.fromToken,
          pendingSwapData.toToken,
          Number(pendingSwapData.fromAmount),
          Number(toAmount)
        );

        // Show success notification
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
      // Show error notification
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

  // Loading state
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
          <FromTokenSection
            control={control}
            errors={errors}
            tokens={tokens || []}
            excludeToken={toToken}
            tokenBalances={tokenBalances}
            fromToken={fromToken}
            handleAmountChange={handleAmountChange}
            handleMaxClick={handleMaxClick}
            trigger={trigger}
          />

          {/* Swap Button */}
          <SwapButton
            onSwap={handleSwapTokens}
            disabled={!fromToken || !toToken}
          />

          {/* To Token Section */}
          <ToTokenSection
            control={control}
            errors={errors}
            tokens={tokens || []}
            excludeToken={fromToken}
            tokenBalances={tokenBalances}
            toToken={toToken}
            toAmount={toAmount}
          />

          {/* Exchange Rate Display */}
          <SwapSummary
            exchangeRate={exchangeRate}
            priceImpact={priceImpact}
            fromToken={fromToken}
            toToken={toToken}
          />

          {/* Submit Button */}
          <SubmitButton
            isFormValid={isFormValid}
            isSwapping={isSwapping}
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            tokenBalances={tokenBalances}
          />
        </form>
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        isLoading={isSwapping}
        pendingSwapData={pendingSwapData}
        toAmount={toAmount}
        exchangeRate={exchangeRate}
        priceImpact={priceImpact}
        onConfirm={executeSwap}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

export default SwapForm;
