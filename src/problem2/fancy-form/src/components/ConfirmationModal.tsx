import React from "react";
import { Modal } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { AlertCircle } from "lucide-react";
import { formatNumber } from "../utils/formatters";
import type { SwapFormData } from "../types";

interface ConfirmationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  pendingSwapData: SwapFormData | null;
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  isLoading,
  pendingSwapData,
  toAmount,
  exchangeRate,
  priceImpact,
  onConfirm,
  onCancel,
}) => {
  if (!pendingSwapData) return null;

  return (
    <Modal
      title="Confirm Swap"
      open={isOpen}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText="Confirm Swap"
      cancelText="Cancel"
    >
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
    </Modal>
  );
};

export default ConfirmationModal;
