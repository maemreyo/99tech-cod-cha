import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createAmountChangeHandler, 
  createSwapTokensHandler, 
  createMaxClickHandler, 
  isFormValid 
} from "../swapFormUtils";
import { PrecisionHandler } from "../../utils/precisionHandler";

// Mock PrecisionHandler
vi.mock("../../utils/precisionHandler", () => {
  return {
    PrecisionHandler: {
      parseNumber: vi.fn((val) => Number(val) || 0),
      isAmountValid: vi.fn((amount, balance) => Number(amount) <= balance),
      formatMaxAmount: vi.fn((balance) => balance.toString()),
      isMaxAmount: vi.fn((amount, balance) => amount === balance.toString()),
    },
  };
});

// Mock formatters
vi.mock("../../utils/formatters", () => ({
  sanitizeNumericInput: vi.fn((value) => value.replace(/[^0-9.]/g, "")),
}));

describe("swapFormUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAmountChangeHandler", () => {
    it("creates a handler that sanitizes input and triggers validation", async () => {
      const trigger = vi.fn().mockResolvedValue(true);
      const onChange = vi.fn();
      const handler = createAmountChangeHandler(trigger);

      // Mock setTimeout
      vi.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
        callback();
        return 0 as any;
      });

      await handler("123.45abc", onChange);

      expect(onChange).toHaveBeenCalledWith("123.45");
      expect(trigger).toHaveBeenCalledWith("fromAmount");
    });
  });

  describe("createSwapTokensHandler", () => {
    it("creates a handler that swaps tokens", () => {
      const fromToken = "ETH";
      const toToken = "BTC";
      const setValue = vi.fn();
      const handler = createSwapTokensHandler(fromToken, toToken, setValue);

      handler("0.5");

      expect(setValue).toHaveBeenCalledTimes(3);
      expect(setValue).toHaveBeenCalledWith("fromToken", "BTC", { shouldValidate: false });
      expect(setValue).toHaveBeenCalledWith("toToken", "ETH", { shouldValidate: false });
      expect(setValue).toHaveBeenCalledWith("fromAmount", "0.5", { shouldValidate: true });
    });

    it("does nothing if tokens are not set", () => {
      const fromToken = "";
      const toToken = "BTC";
      const setValue = vi.fn();
      const handler = createSwapTokensHandler(fromToken, toToken, setValue);

      handler("0.5");

      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe("createMaxClickHandler", () => {
    it("creates a handler that sets max amount", async () => {
      const fromToken = "ETH";
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      const setValue = vi.fn();
      const trigger = vi.fn().mockResolvedValue(true);
      const handler = createMaxClickHandler(fromToken, tokenBalances, setValue, trigger);

      // Mock requestAnimationFrame
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: any) => {
        callback();
        return 0;
      });

      await handler();

      expect(PrecisionHandler.formatMaxAmount).toHaveBeenCalledWith(10);
      expect(setValue).toHaveBeenCalledWith("fromAmount", "10", { shouldValidate: false });
      expect(trigger).toHaveBeenCalledWith("fromAmount");
    });

    it("does nothing if token is not set", async () => {
      const fromToken = "";
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      const setValue = vi.fn();
      const trigger = vi.fn();
      const handler = createMaxClickHandler(fromToken, tokenBalances, setValue, trigger);

      await handler();

      expect(setValue).not.toHaveBeenCalled();
      expect(trigger).not.toHaveBeenCalled();
    });
  });

  describe("isFormValid", () => {
    it("returns false if any required field is missing", () => {
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      
      expect(isFormValid("", "BTC", "1", tokenBalances)).toBe(false);
      expect(isFormValid("ETH", "", "1", tokenBalances)).toBe(false);
      expect(isFormValid("ETH", "BTC", "", tokenBalances)).toBe(false);
    });

    it("returns false if tokens are the same", () => {
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      
      expect(isFormValid("ETH", "ETH", "1", tokenBalances)).toBe(false);
    });

    it("returns false if amount is not positive", () => {
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      
      expect(isFormValid("ETH", "BTC", "0", tokenBalances)).toBe(false);
      expect(isFormValid("ETH", "BTC", "-1", tokenBalances)).toBe(false);
    });

    it("returns false if balance is insufficient", () => {
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      
      // Mock isAmountValid to return false for this test
      vi.mocked(PrecisionHandler.isAmountValid).mockReturnValueOnce(false);
      
      expect(isFormValid("ETH", "BTC", "20", tokenBalances)).toBe(false);
    });

    it("returns true if all validations pass", () => {
      const tokenBalances = { ETH: 10, BTC: 0.5 };
      
      // Mock isAmountValid to return true for this test
      vi.mocked(PrecisionHandler.isAmountValid).mockReturnValueOnce(true);
      
      expect(isFormValid("ETH", "BTC", "5", tokenBalances)).toBe(true);
    });
  });
});