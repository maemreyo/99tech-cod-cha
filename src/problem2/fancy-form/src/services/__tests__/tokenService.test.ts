import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { fetchTokenList, fetchTokenPrices, fetchTokenMetadata, validateTokenIcon, calculatePriceImpact } from "../tokenService";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("tokenService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe("fetchTokenList", () => {
    it("should fetch and process token list", async () => {
      // Mock API response
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { currency: "ETH", date: "2023-01-01", price: 3000 },
          { currency: "BTC", date: "2023-01-01", price: 60000 },
          { currency: "ETH", date: "2023-01-02", price: 3100 }, // Duplicate token with different date
        ],
      });
      
      const result = await fetchTokenList();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2); // Should deduplicate ETH
      expect(result[0].symbol).toBe("BTC"); // Alphabetical order
      expect(result[1].symbol).toBe("ETH");
    });
    
    it("should return default tokens on error", async () => {
      // Mock API error
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));
      
      const result = await fetchTokenList();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result.length).toBeGreaterThan(0); // Should return default tokens
      expect(result.some(token => token.symbol === "ETH")).toBe(true);
    });
  });
  
  describe("fetchTokenPrices", () => {
    it("should fetch and process token prices", async () => {
      // Mock API response
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { currency: "ETH", date: "2023-01-01", price: 3000 },
          { currency: "ETH", date: "2023-01-02", price: 3100 }, // More recent date
          { currency: "BTC", date: "2023-01-01", price: 60000 },
        ],
      });
      
      const result = await fetchTokenPrices();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result.ETH).toBe(3100); // Should use the most recent price
      expect(result.BTC).toBe(60000);
    });
    
    it("should throw error on API failure", async () => {
      // Mock API error
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));
      
      await expect(fetchTokenPrices()).rejects.toThrow("Unable to fetch current prices");
    });
  });
  
  describe("fetchTokenMetadata", () => {
    it("should return token metadata", async () => {
      const result = await fetchTokenMetadata("ETH");
      
      expect(result).not.toBeNull();
      expect(result?.symbol).toBe("ETH");
      expect(result?.name).toBe("Ethereum");
    });
    
    it("should use cache for repeated requests", async () => {
      // First call should create cache entry
      const result1 = await fetchTokenMetadata("ETH");
      
      // Modify the implementation to return different data
      const originalGetTokenName = (global as any).getTokenName;
      (global as any).getTokenName = () => "Modified Name";
      
      // Second call should use cache
      const result2 = await fetchTokenMetadata("ETH");
      
      // Restore original implementation
      (global as any).getTokenName = originalGetTokenName;
      
      expect(result1).toEqual(result2);
    });
  });
  
  describe("validateTokenIcon", () => {
    it("should return true for valid icon URL", async () => {
      // Mock successful head request
      mockedAxios.head.mockResolvedValueOnce({
        status: 200,
      });
      
      const result = await validateTokenIcon("ETH");
      
      expect(mockedAxios.head).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
    
    it("should return false for invalid icon URL", async () => {
      // Mock failed head request
      mockedAxios.head.mockRejectedValueOnce(new Error("404 Not Found"));
      
      const result = await validateTokenIcon("INVALID");
      
      expect(mockedAxios.head).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
  
  describe("calculatePriceImpact", () => {
    it("should calculate price impact based on trade size", () => {
      // Small trade
      const smallImpact = calculatePriceImpact(1, 3000, 60000);
      
      // Large trade
      const largeImpact = calculatePriceImpact(100, 3000, 60000);
      
      expect(largeImpact).toBeGreaterThan(smallImpact);
      expect(smallImpact).toBeGreaterThan(0);
    });
    
    it("should calculate impact for very large trades", () => {
      // Very large trade
      const impact = calculatePriceImpact(10000, 3000, 60000);
      
      // For a trade value of 10000 * 3000 = 30,000,000
      // baseImpact = 0.05
      // sizeImpact = min(30,000,000 / 100000, 0.05) = 0.05 (capped)
      // total = (0.05 + 0.05) * 100 = 10%
      expect(impact).toBe(10);
    });
  });
});