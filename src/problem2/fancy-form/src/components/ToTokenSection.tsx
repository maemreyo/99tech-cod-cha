import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "antd";
import { AlertCircle } from "lucide-react";
import { formatNumber } from "../utils/formatters";
import TokenSelector from "./TokenSelector";
import type { Token } from "../types";
import type { Control, FieldErrors } from "react-hook-form";
import type { SwapFormData } from "../types";

interface ToTokenSectionProps {
  control: Control<SwapFormData>;
  errors: FieldErrors<SwapFormData>;
  tokens: Token[];
  excludeToken: string;
  tokenBalances: Record<string, number>;
  toToken: string;
  toAmount: string;
}

const ToTokenSection: React.FC<ToTokenSectionProps> = ({
  control,
  errors,
  tokens,
  excludeToken,
  tokenBalances,
  toToken,
  toAmount,
}) => {
  return (
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
              excludeToken={excludeToken}
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
  );
};

export default ToTokenSection;
