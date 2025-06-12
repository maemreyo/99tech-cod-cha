import React from "react";
import { Modal, Tooltip, Divider } from "antd";
import { SwapOutlined, InfoCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
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

  // Determine price impact severity
  const getPriceImpactSeverity = () => {
    if (priceImpact > 5) return "high";
    if (priceImpact > 3) return "medium";
    if (priceImpact > 0.1) return "low";
    return "none";
  };

  const priceImpactSeverity = getPriceImpactSeverity();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-center text-xl font-bold">
          <Zap className="mr-2 text-blue-500" size={20} />
          Confirm Swap
        </div>
      }
      open={isOpen}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText="Confirm Swap"
      cancelText="Cancel"
      centered
      width={420}
      okButtonProps={{
        className: `bg-blue-500 hover:bg-blue-600 ${priceImpactSeverity === "high" ? "opacity-90" : ""}`
      }}
      cancelButtonProps={{
        className: "hover:bg-gray-100 dark:hover:bg-gray-800"
      }}
      className="confirmation-modal"
    >
      <motion.div 
        className="space-y-5 py-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Swap visualization */}
        <motion.div 
          className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3 mb-3">
            <ArrowUpCircle className="text-red-500" size={20} />
            <div className="text-xl font-semibold">
              {formatNumber(Number(pendingSwapData.fromAmount))}{" "}
              <span className="font-bold">{pendingSwapData.fromToken}</span>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md my-1"
          >
            <SwapOutlined className="text-lg text-blue-500" />
          </motion.div>
          
          <div className="flex items-center space-x-3 mt-3">
            <ArrowDownCircle className="text-green-500" size={20} />
            <div className="text-xl font-semibold">
              {formatNumber(Number(toAmount))}{" "}
              <span className="font-bold">{pendingSwapData.toToken}</span>
            </div>
          </div>
        </motion.div>

        <Divider className="my-3" />

        {/* Swap details */}
        <motion.div 
          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 mr-1">Exchange Rate</span>
              <Tooltip title="The current exchange rate between these tokens">
                <InfoCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            </div>
            <span className="font-medium">
              1 {pendingSwapData.fromToken} = {formatNumber(exchangeRate)}{" "}
              {pendingSwapData.toToken}
            </span>
          </div>
          
          {priceImpact > 0.1 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-400 mr-1">Price Impact</span>
                <Tooltip title="The difference between market price and estimated price due to trade size">
                  <InfoCircleOutlined className="text-gray-400 text-xs" />
                </Tooltip>
              </div>
              <span
                className={`font-medium flex items-center ${
                  priceImpactSeverity === "high" ? "text-red-500" : 
                  priceImpactSeverity === "medium" ? "text-orange-500" : 
                  "text-yellow-500"
                }`}
              >
                {priceImpactSeverity !== "none" && (
                  <AlertCircle className="mr-1" size={14} />
                )}
                {priceImpact.toFixed(2)}%
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 mr-1">Network Fee</span>
              <Tooltip title="Fee paid to network validators to process your transaction">
                <InfoCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            </div>
            <span className="font-medium flex items-center">
              <DollarOutlined className="mr-1 text-green-500" />
              ~$0.50
            </span>
          </div>
        </motion.div>

        {/* Warning for high price impact */}
        {priceImpact > 3 && (
          <motion.div 
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
            variants={itemVariants}
            animate={{ 
              scale: [1, 1.02, 1],
              transition: { repeat: 2, duration: 1 }
            }}
          >
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm text-red-600 dark:text-red-400">
                <span className="font-semibold">High price impact detected!</span> This trade will move the market price significantly. Consider splitting your trade into smaller amounts to reduce impact.
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Estimated completion time */}
        <motion.div 
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2"
          variants={itemVariants}
        >
          Estimated completion time: ~30 seconds
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default ConfirmationModal;
