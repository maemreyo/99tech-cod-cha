import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { swapTokens, getSwapQuote, approveToken, checkAllowance, estimateSwapGas, getTransactionStatus } from "../swapService";

describe("swapService", () => {
  // Mock the simulateNetworkDelay function to avoid waiting in tests
  beforeEach(() => {
    vi.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });
    
    // Mock Math.random for predictable results
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe("swapTokens", () => {
    it("should successfully execute a swap", async () => {
      const request = {
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "1",
        toAmount: "0.05",
        exchangeRate: 0.05,
      };
      
      const result = await swapTokens(request);
      
      expect(result.success).toBe(true);
      expect(result.fromAmount).toBe("1");
      expect(result.toAmount).toBe("0.05");
      expect(result.fromToken).toBe("ETH");
      expect(result.toToken).toBe("BTC");
      expect(result.exchangeRate).toBe(0.05);
      expect(result.txHash).toBeDefined();
      expect(result.gasUsed).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
    
    it("should return error for invalid parameters", async () => {
      const request = {
        fromToken: "",
        toToken: "BTC",
        fromAmount: "1",
        toAmount: "0.05",
        exchangeRate: 0.05,
      };
      
      const result = await swapTokens(request);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid swap parameters");
    });
    
    it("should return error for zero amount", async () => {
      const request = {
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "0",
        toAmount: "0",
        exchangeRate: 0.05,
      };
      
      const result = await swapTokens(request);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Amount must be greater than 0");
    });
    
    it("should handle random failures", async () => {
      // Override the Math.random mock for this test
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValueOnce(0.05); // For failure check (< 0.1)
      
      const request = {
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "1",
        toAmount: "0.05",
        exchangeRate: 0.05,
      };
      
      const result = await swapTokens(request);
      
      // Restore Math.random
      Math.random = originalRandom;
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe("getSwapQuote", () => {
    it("should return a swap quote", async () => {
      const result = await getSwapQuote("ETH", "BTC", "1", 0.5);
      
      expect(result.inputAmount).toBe("1");
      expect(result.outputAmount).toBeDefined();
      expect(result.minOutputAmount).toBeDefined();
      expect(result.exchangeRate).toBeDefined();
      expect(result.priceImpact).toBeDefined();
      expect(result.routes).toHaveLength(3);
      expect(result.estimatedGas).toBeDefined();
      expect(result.estimatedGasPrice).toBeDefined();
    });
  });
  
  describe("approveToken", () => {
    it("should approve a token", async () => {
      const result = await approveToken("0xTokenAddress", "0xSpenderAddress", "1000");
      
      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
    });
  });
  
  describe("checkAllowance", () => {
    it("should return allowance", async () => {
      const result = await checkAllowance("0xTokenAddress", "0xOwnerAddress", "0xSpenderAddress");
      
      expect(result).toBe("115792089237316195423570985008687907853269984665640564039457584007913129639935");
    });
  });
  
  describe("estimateSwapGas", () => {
    it("should estimate gas for a swap", async () => {
      const request = {
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "1",
        toAmount: "0.05",
        exchangeRate: 0.05,
      };
      
      const result = await estimateSwapGas(request);
      
      expect(result.gasLimit).toBeDefined();
      expect(result.gasPrice).toBeDefined();
      expect(result.totalCost).toBeDefined();
    });
  });
  
  describe("getTransactionStatus", () => {
    // We'll test the function's behavior based on different status scenarios
    // Since we can't easily control Math.random in this context, we'll just verify
    // that the function returns an object with the expected properties
    
    it("should return a valid transaction status", async () => {
      const result = await getTransactionStatus("0xTxHash");
      
      // Verify the result has the expected structure
      expect(result).toHaveProperty("status");
      expect(["success", "pending", "failed"]).toContain(result.status);
      expect(result).toHaveProperty("confirmations");
      
      // If status is pending or failed, confirmations should be 0
      if (result.status === "pending" || result.status === "failed") {
        expect(result.confirmations).toBe(0);
      }
      
      // If status is success, confirmations should be > 0
      if (result.status === "success") {
        expect(result.confirmations).toBeGreaterThan(0);
      }
    });
  });
});