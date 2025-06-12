import React from "react";
import { Tooltip } from "antd";
import { ArrowUpDown } from "lucide-react";

interface SwapButtonProps {
  onSwap: () => void;
  disabled: boolean;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onSwap, disabled }) => {
  return (
    <div className="swap-button-container">
      <Tooltip title="Swap tokens">
        <button
          type="button"
          className="swap-rotate-button"
          onClick={onSwap}
          disabled={disabled}
        >
          <ArrowUpDown size={20} color="white" />
        </button>
      </Tooltip>
    </div>
  );
};

export default SwapButton;