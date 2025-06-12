import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSwapSchema } from "../swapFormSchema";
import { PrecisionHandler } from "../../utils/precisionHandler";

// Mock PrecisionHandler
vi.mock("../../utils/precisionHandler", () => {
  return {
    PrecisionHandler: {
      parseNumber: vi.fn((val) => Number(val) || 0),
      isAmountValid: vi.fn((amount, balance, decimals) => {
        const numAmount = Number(amount);
        return !isNaN(numAmount) && numAmount <= balance;
      }),
    },
  };
});

describe("swapFormSchema", () => {
  const mockTokenBalances = {
    ETH: 10,
    BTC: 0.5,
    USDC: 1000,
  };

  const mockTokenDecimals = {
    ETH: 18,
    BTC: 8,
    USDC: 6,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates required fields", () => {
    const schema = createSwapSchema(mockTokenBalances);

    // All fields missing
    const result1 = schema.safeParse({
      fromToken: "",
      toToken: "",
      fromAmount: "",
    });
    expect(result1.success).toBe(false);
    
    // Only fromToken provided
    const result2 = schema.safeParse({
      fromToken: "ETH",
      toToken: "",
      fromAmount: "",
    });
    expect(result2.success).toBe(false);
    
    // Only toToken provided
    const result3 = schema.safeParse({
      fromToken: "",
      toToken: "BTC",
      fromAmount: "",
    });
    expect(result3.success).toBe(false);
    
    // Only fromAmount provided
    const result4 = schema.safeParse({
      fromToken: "",
      toToken: "",
      fromAmount: "1",
    });
    expect(result4.success).toBe(false);
  });

  it("validates token selection", () => {
    const schema = createSwapSchema(mockTokenBalances);
    
    // Same tokens
    const result1 = schema.safeParse({
      fromToken: "ETH",
      toToken: "ETH",
      fromAmount: "1",
    });
    expect(result1.success).toBe(false);
    
    // Different tokens
    const result2 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "1",
    });
    expect(result2.success).toBe(true);
  });

  it("validates amount format", () => {
    const schema = createSwapSchema(mockTokenBalances);
    
    // Non-numeric amount
    const result1 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "abc",
    });
    expect(result1.success).toBe(false);
    
    // Zero amount
    const result2 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "0",
    });
    expect(result2.success).toBe(false);
    
    // Negative amount
    const result3 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "-1",
    });
    expect(result3.success).toBe(false);
    
    // Valid amount
    const result4 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "1",
    });
    expect(result4.success).toBe(true);
  });

  it("validates balance", () => {
    const schema = createSwapSchema(mockTokenBalances);
    
    // Amount exceeds balance
    const result1 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "20", // ETH balance is 10
    });
    expect(result1.success).toBe(false);
    
    // Amount equals balance
    const result2 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "10", // ETH balance is 10
    });
    expect(result2.success).toBe(true);
    
    // Amount less than balance
    const result3 = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "5", // ETH balance is 10
    });
    expect(result3.success).toBe(true);
  });

  it("uses token decimals when provided", () => {
    const schema = createSwapSchema(mockTokenBalances, mockTokenDecimals);
    
    // Valid data
    const result = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "5",
    });
    
    expect(result.success).toBe(true);
    
    // Verify PrecisionHandler was called with correct decimals
    expect(PrecisionHandler.isAmountValid).toHaveBeenCalledWith("5", 10, 18);
  });

  it("uses default decimals when token decimals not provided", () => {
    const schema = createSwapSchema(mockTokenBalances);
    
    // Valid data
    const result = schema.safeParse({
      fromToken: "ETH",
      toToken: "BTC",
      fromAmount: "5",
    });
    
    expect(result.success).toBe(true);
    
    // Default decimals should be used (18)
    expect(PrecisionHandler.isAmountValid).toHaveBeenCalledWith("5", 10, 18);
  });
});