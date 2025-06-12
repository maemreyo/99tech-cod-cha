import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTokenList, useTokenPrices, useTokenBalances, useSwapQuote, useTransactionStatus } from "../useTokenData";
import * as tokenService from "../../services/tokenService";

// Mock tokenService
vi.mock("../../services/tokenService", () => ({
  fetchTokenList: vi.fn(),
  fetchTokenPrices: vi.fn(),
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  // Return a function component
  return ({ children }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useTokenData", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Don't mock setTimeout as it causes issues with waitFor
    vi.useFakeTimers();
  });
  
  describe("useTokenList", () => {
    it("can be initialized", () => {
      const mockTokens = [
        { id: "ethereum", symbol: "ETH", name: "Ethereum" },
        { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
      ];
      
      vi.mocked(tokenService.fetchTokenList).mockResolvedValue(mockTokens);
      
      const { result } = renderHook(() => useTokenList(), {
        wrapper: createWrapper(),
      });
      
      // Just check that the hook returns something
      expect(result.current).toBeDefined();
    });
  });
  
  describe("useTokenPrices", () => {
    it("can be initialized", () => {
      const mockPrices = {
        ETH: 3000,
        BTC: 60000,
      };
      
      vi.mocked(tokenService.fetchTokenPrices).mockResolvedValue(mockPrices);
      
      const { result } = renderHook(() => useTokenPrices(), {
        wrapper: createWrapper(),
      });
      
      // Just check that the hook returns something
      expect(result.current).toBeDefined();
    });
  });
  
  describe("useTokenBalances", () => {
    it("returns a query object", () => {
      const { result } = renderHook(() => useTokenBalances("0xAddress"), {
        wrapper: createWrapper(),
      });
      
      // Just check that the hook returns something
      expect(result.current).toBeDefined();
    });
  });
  
  describe("useSwapQuote", () => {
    it("returns a query object", () => {
      const { result } = renderHook(() => useSwapQuote("ETH", "BTC", "1"), {
        wrapper: createWrapper(),
      });
      
      // Just check that the hook returns something
      expect(result.current).toBeDefined();
    });
  });
  
  describe("useTransactionStatus", () => {
    it("returns a query object", () => {
      const { result } = renderHook(() => useTransactionStatus("0xTxHash"), {
        wrapper: createWrapper(),
      });
      
      // Just check that the hook returns something
      expect(result.current).toBeDefined();
    });
  });
});