import React from "react";
import { Button } from "antd";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isFormValid: boolean;
  isSwapping: boolean;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  tokenBalances: Record<string, number>;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isFormValid,
  isSwapping,
  fromToken,
  toToken,
  fromAmount,
  tokenBalances,
}) => {
  // Determine button text based on form state
  const getButtonText = () => {
    if (isSwapping) {
      return <Loader2 className="animate-spin" size={16} />;
    }

    if (isFormValid) {
      return "Swap Tokens";
    }

    if (!fromToken || !toToken) {
      return "Select tokens";
    }

    if (!fromAmount) {
      return "Enter an amount";
    }

    if (Number(fromAmount) <= 0) {
      return "Enter valid amount";
    }

    if (tokenBalances[fromToken] < Number(fromAmount)) {
      return "Insufficient balance";
    }

    return "Enter an amount";
  };

  return (
    <Button
      type="primary"
      htmlType="submit"
      className={`submit-button ${isSwapping ? "loading" : ""}`}
      disabled={!isFormValid || isSwapping}
      block
      size="large"
    >
      {getButtonText()}
    </Button>
  );
};

export default SubmitButton;
