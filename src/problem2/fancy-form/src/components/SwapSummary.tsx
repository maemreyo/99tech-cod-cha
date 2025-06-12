import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "../utils/formatters";

interface SwapSummaryProps {
  exchangeRate: number;
  priceImpact: number;
  fromToken: string;
  toToken: string;
}

const SwapSummary: React.FC<SwapSummaryProps> = ({
  exchangeRate,
  priceImpact,
  fromToken,
  toToken,
}) => {
  if (exchangeRate <= 0) return null;

  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
};

export default SwapSummary;
