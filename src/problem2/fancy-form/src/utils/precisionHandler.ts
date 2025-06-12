/**
 * Enhanced precision handling optimized for token swap
 */
export class PrecisionHandler {
  // Most tokens use 18 decimals, some use 6 (USDC), 8 (WBTC)
  private static readonly DEFAULT_DECIMALS = 18;
  private static readonly PRECISION = 1e18; // Match token decimals
  private static readonly TOLERANCE = 1e-10; // Reasonable tolerance for UI
  
  /**
   * Safe string to number conversion
   */
  static parseNumber(value: string): number {
    if (!value || value === '') return 0;
    
    // Handle scientific notation
    if (value.includes('e') || value.includes('E')) {
      return parseFloat(value);
    }
    
    // Handle normal decimal
    return parseFloat(value);
  }
  
  /**
   * Safe decimal arithmetic using string manipulation
   * Avoids JavaScript floating point issues entirely
   */
  static compareDecimals(a: string, b: string): number {
    // Normalize both numbers to same decimal places
    const aParts = a.split('.');
    const bParts = b.split('.');
    
    const aInteger = aParts[0] || '0';
    const bInteger = bParts[0] || '0';
    
    const aDecimal = (aParts[1] || '').padEnd(this.DEFAULT_DECIMALS, '0');
    const bDecimal = (bParts[1] || '').padEnd(this.DEFAULT_DECIMALS, '0');
    
    // Compare as big integers
    const aBigInt = BigInt(aInteger + aDecimal);
    const bBigInt = BigInt(bInteger + bDecimal);
    
    if (aBigInt < bBigInt) return -1;
    if (aBigInt > bBigInt) return 1;
    return 0;
  }
  
  /**
   * Token-specific amount validation
   */
  static isAmountValid(amount: number | string, balance: number, tokenDecimals = 18): boolean {
    const amountStr = typeof amount === 'string' ? amount : amount.toString();
    const balanceStr = balance.toString();
    
    // Strategy 1: String-based decimal comparison (most accurate)
    try {
      return this.compareDecimals(amountStr, balanceStr) <= 0;
    } catch (error) {
      console.warn('String comparison failed, falling back to numeric:', error);
    }
    
    // Strategy 2: Numeric with tolerance (fallback)
    const amountNum = typeof amount === 'string' ? this.parseNumber(amount) : amount;
    
    // For very small differences (dust), be more lenient
    const diff = amountNum - balance;
    if (Math.abs(diff) < this.TOLERANCE) {
      return true;
    }
    
    return amountNum <= balance;
  }
  
  /**
   * Format balance for MAX button - optimized for tokens
   */
  static formatMaxAmount(balance: number, tokenDecimals = 18): string {
    // Handle very large numbers (like SHIB with trillions of tokens)
    if (balance >= 1e15) {
      // For very large numbers, use scientific notation carefully
      const str = balance.toString();
      if (str.includes('e')) {
        // Convert scientific to decimal, but limit precision
        return balance.toFixed(0); // No decimals for very large amounts
      }
      return str;
    }
    
    // Handle very small numbers (like expensive tokens)
    if (balance < 1e-6) {
      return balance.toString(); // Keep full precision for small amounts
    }
    
    // For normal token amounts, use appropriate precision
    const str = balance.toString();
    
    if (str.includes('e')) {
      // Convert scientific notation to decimal
      const fixed = balance.toFixed(tokenDecimals);
      return fixed.replace(/\.?0+$/, ''); // Remove trailing zeros
    }
    
    // Limit decimal places to token decimals
    const parts = str.split('.');
    if (parts[1] && parts[1].length > tokenDecimals) {
      const fixed = balance.toFixed(tokenDecimals);
      return fixed.replace(/\.?0+$/, '');
    }
    
    return str;
  }
  
  /**
   * Check if amount represents the maximum available balance
   */
  static isMaxAmount(amount: string, balance: number): boolean {
    const formattedMax = this.formatMaxAmount(balance);
    return amount === formattedMax || amount === balance.toString();
  }
}