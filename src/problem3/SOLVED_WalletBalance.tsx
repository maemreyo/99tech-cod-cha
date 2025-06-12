import React, { useMemo } from 'react';
import { BoxProps } from './types'; // Assuming BoxProps is imported from somewhere

// Define blockchain type for type safety
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string;

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface WalletPageProps extends BoxProps {}

// Extract as a pure function outside component for better performance
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  'Osmosis': 100,
  'Ethereum': 50,
  'Arbitrum': 30,
  'Zilliqa': 20,
  'Neo': 20,
};

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
};

const WalletPage: React.FC<WalletPageProps> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();
  
  // Properly filter and sort balances with memoization
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Fixed logic: only include balances with positive amounts and valid priority
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        // Sort by priority (descending) then by amount (descending)
        if (leftPriority !== rightPriority) {
          return rightPriority - leftPriority; // Simplified comparison
        }
        return rhs.amount - lhs.amount; // Secondary sort by amount
      });
  }, [balances]); // Removed 'prices' from dependencies as it's not used here
  
  // Properly format balances with memoization
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => ({
      ...balance,
      formatted: balance.amount.toFixed(2), // Consistent 2 decimal places
    }));
  }, [sortedBalances]);
  
  // Generate rows using formattedBalances and proper keys
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      
      // Use a stable key combining blockchain and currency
      const key = `${balance.blockchain}-${balance.currency}`;
      
      return (
        <WalletRow
          className="wallet-row" // Removed undefined 'classes' reference
          key={key}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);
  
  // Filter out BoxProps that shouldn't be on a div
  const { component, ...divProps } = rest as any;
  
  return (
    <div {...divProps}>
      {rows}
    </div>
  );
};

export default WalletPage;

// Type definitions for the custom hooks (for reference)
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;

// Assumed WalletRow component interface
interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}
declare const WalletRow: React.FC<WalletRowProps>;