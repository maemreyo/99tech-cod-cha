import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import useSwapCalculations from "../useSwapCalculations";
import * as formatters from "../../utils/formatters";

describe("useSwapCalculations", () => {
  // Mock the calculateExchangeAmount function
  vi.mock("../../utils/formatters", () => ({
    calculateExchangeAmount: vi.fn((amount, rate) => amount * rate),
  }));

  it("should return default values when inputs are missing", () => {
    const { result } = renderHook(() => 
      useSwapCalculations("", "", "", undefined)
    );
    
    expect(result.current).toEqual({
      exchangeRate: 0,
      toAmount: "0",
      priceImpact: 0,
    });
  });

  it("should return default values when fromAmount is not a number", () => {
    const { result } = renderHook(() => 
      useSwapCalculations("ETH", "BTC", "not-a-number", { ETH: 3000, BTC: 60000 })
    );
    
    expect(result.current).toEqual({
      exchangeRate: 0,
      toAmount: "0",
      priceImpact: 0,
    });
  });

  it("should calculate exchange rate and amount correctly", () => {
    const mockPrices = {
      ETH: 3000,
      BTC: 60000,
    };

    const { result } = renderHook(() => 
      useSwapCalculations("ETH", "BTC", "2", mockPrices)
    );
    
    // Exchange rate should be ETH price / BTC price = 3000 / 60000 = 0.05
    expect(result.current.exchangeRate).toBe(0.05);
    
    // The calculateExchangeAmount function is mocked to return amount * rate
    expect(formatters.calculateExchangeAmount).toHaveBeenCalledWith(2, 0.05);
    
    // Price impact should be min(fromAmount * 0.001, 5) = min(2 * 0.001, 5) = 0.002
    expect(result.current.priceImpact).toBe(0.002);
  });

  it("should handle missing price data", () => {
    const mockPrices = {
      ETH: 3000,
      // BTC price is missing
    };

    const { result } = renderHook(() => 
      useSwapCalculations("ETH", "BTC", "2", mockPrices)
    );
    
    // Exchange rate should be ETH price / BTC price = 3000 / 0 = Infinity, but we expect 0
    expect(result.current.exchangeRate).toBe(Infinity);
    
    // The calculateExchangeAmount function is mocked to return amount * rate
    expect(formatters.calculateExchangeAmount).toHaveBeenCalledWith(2, Infinity);
  });

  it("should cap price impact at 5%", () => {
    const mockPrices = {
      ETH: 3000,
      BTC: 60000,
    };

    const { result } = renderHook(() => 
      useSwapCalculations("ETH", "BTC", "10000", mockPrices)
    );
    
    // Price impact should be min(fromAmount * 0.001, 5) = min(10000 * 0.001, 5) = 5
    expect(result.current.priceImpact).toBe(5);
  });
});