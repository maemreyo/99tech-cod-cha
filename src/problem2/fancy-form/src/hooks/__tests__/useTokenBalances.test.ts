import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useTokenBalances from "../useTokenBalances";
import type { Token } from "../../types";

describe("useTokenBalances", () => {
  // Mock Math.random to return predictable values
  const originalRandom = Math.random;
  
  beforeEach(() => {
    Math.random = vi.fn().mockReturnValue(0.5);
  });
  
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("should initialize with empty balances", () => {
    const { result } = renderHook(() => useTokenBalances(undefined));
    expect(result.current.tokenBalances).toEqual({});
  });

  it("should initialize balances for provided tokens", () => {
    const mockTokens: Token[] = [
      { id: "ethereum", symbol: "ETH", name: "Ethereum" },
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    ];

    const { result } = renderHook(() => useTokenBalances(mockTokens));
    
    // With Math.random mocked to return 0.5, each token should have a balance of 0.5 * 1000 + 100 = 600
    expect(result.current.tokenBalances).toEqual({
      ETH: 600,
      BTC: 600,
    });
  });

  it("should update balances after a swap", () => {
    const mockTokens: Token[] = [
      { id: "ethereum", symbol: "ETH", name: "Ethereum" },
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    ];

    const { result } = renderHook(() => useTokenBalances(mockTokens));
    
    // Initial balances
    expect(result.current.tokenBalances).toEqual({
      ETH: 600,
      BTC: 600,
    });

    // Update balances after a swap
    act(() => {
      result.current.updateBalances("ETH", "BTC", 1, 0.05);
    });

    // Check updated balances
    expect(result.current.tokenBalances).toEqual({
      ETH: 599,
      BTC: 600.05,
    });
  });

  it("should allow setting balances directly", () => {
    const { result } = renderHook(() => useTokenBalances(undefined));
    
    // Initial empty balances
    expect(result.current.tokenBalances).toEqual({});

    // Set balances directly
    act(() => {
      result.current.setTokenBalances({
        ETH: 10,
        BTC: 0.5,
      });
    });

    // Check updated balances
    expect(result.current.tokenBalances).toEqual({
      ETH: 10,
      BTC: 0.5,
    });
  });
});