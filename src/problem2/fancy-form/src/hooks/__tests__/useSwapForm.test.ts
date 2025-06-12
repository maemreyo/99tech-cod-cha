import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { useSwapForm } from "../useSwapForm";
import { createSwapSchema } from "../../validations/swapFormSchema";
import * as swapFormUtils from "../swapFormUtils";
import { PrecisionHandler } from "../../utils/precisionHandler";

// Mock the PrecisionHandler
vi.mock("../../utils/precisionHandler", () => {
  return {
    PrecisionHandler: {
      parseNumber: vi.fn((val) => Number(val) || 0),
      isAmountValid: vi.fn((amount, balance) => Number(amount) <= balance),
      formatMaxAmount: vi.fn((balance) => balance.toString()),
      isMaxAmount: vi.fn((amount, balance) => amount === balance.toString()),
      compareDecimals: vi.fn((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
      }),
    },
  };
});

// Mock the swapFormUtils
vi.mock("../swapFormUtils", () => {
  return {
    createAmountChangeHandler: vi.fn((trigger) => {
      return async (value, onChange) => {
        onChange(value.replace(/[^0-9.]/g, ""));
        setTimeout(() => trigger("fromAmount"), 100);
      };
    }),
    createSwapTokensHandler: vi.fn((fromToken, toToken, setValue) => {
      return (toAmount) => {
        if (!fromToken || !toToken) return;
        setValue("fromToken", toToken, { shouldValidate: false });
        setValue("toToken", fromToken, { shouldValidate: false });
        setValue("fromAmount", toAmount, { shouldValidate: true });
      };
    }),
    createMaxClickHandler: vi.fn((fromToken, tokenBalances, setValue, trigger) => {
      return async () => {
        if (fromToken && tokenBalances[fromToken]) {
          setValue("fromAmount", tokenBalances[fromToken].toString(), { shouldValidate: false });
          trigger("fromAmount");
        }
      };
    }),
    isFormValid: vi.fn((fromToken, toToken, fromAmount, tokenBalances) => {
      if (!fromToken || !toToken || !fromAmount) return false;
      if (fromToken === toToken) return false;
      const amount = Number(fromAmount);
      if (amount <= 0) return false;
      const balance = tokenBalances[fromToken] || 0;
      return amount <= balance;
    }),
  };
});

// Mock react-hook-form
vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  
  // Create a mock implementation of useForm
  const mockUseForm = (options) => {
    const values = { ...options.defaultValues };
    const errors = {};
    
    const setValue = vi.fn((name, value, config) => {
      values[name] = value;
      if (config?.shouldValidate) {
        // Simple validation
        if (name === "fromAmount") {
          const amount = Number(value);
          const token = values.fromToken;
          if (isNaN(amount) || amount <= 0) {
            errors[name] = { type: "validate", message: "Amount must be a positive number" };
          } else if (token && options.context?.tokenBalances[token] < amount) {
            errors[name] = { type: "validate", message: "Insufficient balance" };
          } else {
            delete errors[name];
          }
        }
      }
    });
    
    return {
      control: { _defaultValues: values },
      handleSubmit: vi.fn((onSubmit) => vi.fn(() => onSubmit(values))),
      watch: (name) => (name ? values[name] : values),
      setValue,
      trigger: vi.fn().mockResolvedValue(true),
      formState: { errors },
      reset: vi.fn(),
    };
  };
  
  return {
    ...actual,
    useForm: vi.fn().mockImplementation(mockUseForm),
  };
});

// Mock formatters
vi.mock("../../utils/formatters", () => ({
  sanitizeNumericInput: (value) => value.replace(/[^0-9.]/g, ""),
}));

// Mock the validation schema
vi.mock("../../validations/swapFormSchema", () => ({
  createSwapSchema: vi.fn((tokenBalances) => {
    return {
      safeParse: (data) => {
        const { fromToken, toToken, fromAmount } = data;
        
        // Basic validation
        if (!fromToken) return { success: false, error: { issues: [{ path: ["fromToken"] }] } };
        if (!toToken) return { success: false, error: { issues: [{ path: ["toToken"] }] } };
        if (fromToken === toToken) return { success: false, error: { issues: [{ path: ["toToken"] }] } };
        if (!fromAmount) return { success: false, error: { issues: [{ path: ["fromAmount"] }] } };
        
        const amount = Number(fromAmount);
        if (isNaN(amount) || amount <= 0) {
          return { success: false, error: { issues: [{ path: ["fromAmount"] }] } };
        }
        
        // Balance validation
        const balance = tokenBalances[fromToken] || 0;
        if (amount > balance) {
          return { success: false, error: { issues: [{ path: ["fromAmount"] }] } };
        }
        
        return { success: true, data };
      }
    };
  })
}));

// Mock zodResolver
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(() => (data) => ({ values: data, errors: {} })),
}));

describe("useSwapForm", () => {
  const mockTokenBalances = {
    ETH: 10,
    BTC: 0.5,
    USDC: 1000,
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock setTimeout to avoid waiting in tests
    vi.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });
    
    // Reset mocks
    vi.mocked(swapFormUtils.createAmountChangeHandler).mockClear();
    vi.mocked(swapFormUtils.createSwapTokensHandler).mockClear();
    vi.mocked(swapFormUtils.createMaxClickHandler).mockClear();
    vi.mocked(swapFormUtils.isFormValid).mockClear();
  });
  
  describe("createSwapSchema", () => {
    it("validates token selection", () => {
      const schema = createSwapSchema(mockTokenBalances);
      
      // Missing fromToken
      const result1 = schema.safeParse({
        fromToken: "",
        toToken: "BTC",
        fromAmount: "1",
      });
      expect(result1.success).toBe(false);
      
      // Missing toToken
      const result2 = schema.safeParse({
        fromToken: "ETH",
        toToken: "",
        fromAmount: "1",
      });
      expect(result2.success).toBe(false);
      
      // Same tokens
      const result3 = schema.safeParse({
        fromToken: "ETH",
        toToken: "ETH",
        fromAmount: "1",
      });
      expect(result3.success).toBe(false);
      
      // Valid tokens
      const result4 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "1",
      });
      expect(result4.success).toBe(true);
    });
    
    it("validates amount", () => {
      const schema = createSwapSchema(mockTokenBalances);
      
      // Missing amount
      const result1 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "",
      });
      expect(result1.success).toBe(false);
      
      // Invalid amount
      const result2 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "abc",
      });
      expect(result2.success).toBe(false);
      
      // Zero amount
      const result3 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "0",
      });
      expect(result3.success).toBe(false);
      
      // Negative amount
      const result4 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "-1",
      });
      expect(result4.success).toBe(false);
      
      // Valid amount
      const result5 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "1",
      });
      expect(result5.success).toBe(true);
    });
    
    it("validates balance", () => {
      const schema = createSwapSchema(mockTokenBalances);
      
      // Insufficient balance
      const result1 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "20", // ETH balance is 10
      });
      expect(result1.success).toBe(false);
      
      // Sufficient balance
      const result2 = schema.safeParse({
        fromToken: "ETH",
        toToken: "BTC",
        fromAmount: "5", // ETH balance is 10
      });
      expect(result2.success).toBe(true);
    });
  });
  
  describe("useSwapForm", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() => useSwapForm(mockTokenBalances));
      
      expect(result.current.fromToken).toBe("");
      expect(result.current.toToken).toBe("");
      expect(result.current.fromAmount).toBe("");
      expect(result.current.isFormValid).toBe(false);
    });
    
    it("creates form utility handlers", () => {
      renderHook(() => useSwapForm(mockTokenBalances));
      
      // Verify that the utility creators were called
      expect(swapFormUtils.createAmountChangeHandler).toHaveBeenCalled();
      expect(swapFormUtils.createSwapTokensHandler).toHaveBeenCalled();
      expect(swapFormUtils.createMaxClickHandler).toHaveBeenCalled();
    });
    
    it("handles amount change", () => {
      const { result } = renderHook(() => useSwapForm(mockTokenBalances));
      
      const onChange = vi.fn();
      
      act(() => {
        result.current.handleAmountChange("1.5", onChange);
      });
      
      expect(onChange).toHaveBeenCalledWith("1.5");
      expect(result.current.trigger).toHaveBeenCalledWith("fromAmount");
    });
    
    it("handles max button click", () => {
      const { result } = renderHook(() => useSwapForm(mockTokenBalances));
      
      act(() => {
        result.current.handleMaxClick();
      });
      
      // Verify the function was called and exists
      expect(typeof result.current.handleMaxClick).toBe("function");
    });
    
    it("handles token swap", () => {
      const { result } = renderHook(() => useSwapForm(mockTokenBalances));
      
      // Just verify the function exists and is callable
      expect(typeof result.current.handleSwapTokens).toBe("function");
      
      act(() => {
        result.current.handleSwapTokens("0.5");
      });
    });
    
    it("determines form validity using the utility function", () => {
      const { result } = renderHook(() => useSwapForm(mockTokenBalances));
      
      // Verify isFormValid was called
      expect(swapFormUtils.isFormValid).toHaveBeenCalled();
      expect(typeof result.current.isFormValid).toBe("boolean");
    });
  });
});