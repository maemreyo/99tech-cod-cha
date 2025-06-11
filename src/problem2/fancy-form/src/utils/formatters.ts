/**
 * Format number with appropriate decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: auto)
 * @returns Formatted string
 */
export const formatNumber = (value: number, decimals?: number): string => {
  if (value === 0) return '0';
  
  // Auto-determine decimals based on value size
  if (decimals === undefined) {
    if (value >= 1000) {
      decimals = 0;
    } else if (value >= 1) {
      decimals = 2;
    } else if (value >= 0.01) {
      decimals = 4;
    } else {
      decimals = 6;
    }
  }

  // Format with commas and decimals
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

  return formatted;
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param value - Number to format
 * @returns Abbreviated string
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) {
    return formatNumber(value / 1e9, 2) + 'B';
  } else if (value >= 1e6) {
    return formatNumber(value / 1e6, 2) + 'M';
  } else if (value >= 1e3) {
    return formatNumber(value / 1e3, 2) + 'K';
  }
  return formatNumber(value, 2);
};

/**
 * Format USD value
 * @param value - USD amount
 * @returns Formatted USD string
 */
export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Calculate exchange amount based on rate
 * @param inputAmount - Amount to convert
 * @param rate - Exchange rate
 * @returns Output amount
 */
export const calculateExchangeAmount = (
  inputAmount: number,
  rate: number
): number => {
  if (!inputAmount || !rate || rate === 0) return 0;
  return inputAmount * rate;
};

/**
 * Calculate price impact percentage
 * @param inputAmount - Input amount
 * @param outputAmount - Expected output amount
 * @param marketRate - Market exchange rate
 * @returns Price impact percentage
 */
export const calculatePriceImpact = (
  inputAmount: number,
  outputAmount: number,
  marketRate: number
): number => {
  if (!inputAmount || !outputAmount || !marketRate) return 0;
  
  const expectedOutput = inputAmount * marketRate;
  const impact = ((expectedOutput - outputAmount) / expectedOutput) * 100;
  
  return Math.abs(impact);
};

/**
 * Validate numeric input
 * @param value - Input value
 * @returns Sanitized numeric string
 */
export const sanitizeNumericInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Remove leading zeros (except for decimals)
  if (sanitized.length > 1 && sanitized[0] === '0' && sanitized[1] !== '.') {
    sanitized = sanitized.substring(1);
  }
  
  return sanitized;
};

/**
 * Parse numeric string to number safely
 * @param value - String value
 * @returns Parsed number or 0
 */
export const parseNumericString = (value: string): number => {
  const sanitized = sanitizeNumericInput(value);
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format percentage
 * @param value - Percentage value (e.g., 0.05 for 5%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return formatNumber(value * 100, decimals) + '%';
};

/**
 * Shorten address for display
 * @param address - Full address
 * @param chars - Number of characters to show on each side
 * @returns Shortened address
 */
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format transaction hash
 * @param hash - Transaction hash
 * @returns Formatted hash
 */
export const formatTxHash = (hash: string): string => {
  return shortenAddress(hash, 6);
};

/**
 * Calculate time ago
 * @param timestamp - Unix timestamp or Date
 * @returns Human-readable time ago string
 */
export const timeAgo = (timestamp: number | Date): string => {
  const now = Date.now();
  const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  const diff = now - time;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sleep function for delays
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get token amount with decimals
 * @param amount - Raw amount
 * @param decimals - Token decimals
 * @returns Formatted amount
 */
export const formatTokenAmount = (amount: string, decimals: number = 18): string => {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.replace(/0+$/, '');
  
  return `${wholePart}.${trimmed}`;
};

/**
 * Parse token amount to raw value
 * @param amount - Human-readable amount
 * @param decimals - Token decimals
 * @returns Raw amount as string
 */
export const parseTokenAmount = (amount: string, decimals: number = 18): string => {
  const [whole, fractional = ''] = amount.split('.');
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
  return whole + paddedFractional;
};