import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "antd";
import { AlertCircle } from "lucide-react";
import { formatNumber } from "../utils/formatters";
import TokenSelector from "./TokenSelector";
import type { Token } from "../types";
import type { Control, FieldErrors } from "react-hook-form";
import type { SwapFormData } from "../types";

interface FromTokenSectionProps {
  control: Control<SwapFormData>;
  errors: FieldErrors<SwapFormData>;
  tokens: Token[];
  excludeToken: string;
  tokenBalances: Record<string, number>;
  fromToken: string;
  handleAmountChange: (
    value: string,
    onChange: (value: string) => void
  ) => void;
  handleMaxClick: () => void;
  trigger: (name: "fromAmount") => Promise<boolean>;
}

const FromTokenSection: React.FC<FromTokenSectionProps> = ({
  control,
  errors,
  tokens,
  excludeToken,
  tokenBalances,
  fromToken,
  handleAmountChange,
  handleMaxClick,
  trigger,
}) => {
  return (
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
              excludeToken={excludeToken}
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
            className={`amount-input ${errors.fromAmount ? "input-error" : ""}`}
            placeholder="0.00"
            autoComplete="off"
            type="text"
            pattern="[0-9]*[.,]?[0-9]*"
            inputMode="decimal"
            onChange={(e) => handleAmountChange(e.target.value, field.onChange)}
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
  );
};

export default FromTokenSection;
