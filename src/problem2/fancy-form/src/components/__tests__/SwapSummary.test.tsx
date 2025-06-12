import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import SwapSummary from "../SwapSummary";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock formatters
vi.mock("../../utils/formatters", () => ({
  formatNumber: (value: number) => value.toString(),
}));

describe("SwapSummary", () => {
  it("renders exchange rate information", () => {
    render(
      <SwapSummary
        exchangeRate={0.05}
        priceImpact={0.05}
        fromToken="ETH"
        toToken="BTC"
      />
    );
    
    expect(screen.getByText("Exchange Rate")).toBeInTheDocument();
    expect(screen.getByText("1 ETH = 0.05 BTC")).toBeInTheDocument();
  });
  
  it("does not render when exchange rate is zero", () => {
    const { container } = render(
      <SwapSummary
        exchangeRate={0}
        priceImpact={0.05}
        fromToken="ETH"
        toToken="BTC"
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
  
  it("shows price impact when it's greater than 0.1%", () => {
    render(
      <SwapSummary
        exchangeRate={0.05}
        priceImpact={0.2}
        fromToken="ETH"
        toToken="BTC"
      />
    );
    
    expect(screen.getByText("Price Impact")).toBeInTheDocument();
    expect(screen.getByText("0.20%")).toBeInTheDocument();
  });
  
  it("does not show price impact when it's less than or equal to 0.1%", () => {
    render(
      <SwapSummary
        exchangeRate={0.05}
        priceImpact={0.1}
        fromToken="ETH"
        toToken="BTC"
      />
    );
    
    expect(screen.queryByText("Price Impact")).not.toBeInTheDocument();
  });
  
  it("shows price impact in red when it's greater than 3%", () => {
    render(
      <SwapSummary
        exchangeRate={0.05}
        priceImpact={3.5}
        fromToken="ETH"
        toToken="BTC"
      />
    );
    
    const impactElement = screen.getByText("3.50%");
    expect(impactElement).toHaveClass("text-red-500");
  });
  
  it("shows price impact in yellow when it's between 0.1% and 3%", () => {
    render(
      <SwapSummary
        exchangeRate={0.05}
        priceImpact={2.5}
        fromToken="ETH"
        toToken="BTC"
      />
    );
    
    const impactElement = screen.getByText("2.50%");
    expect(impactElement).toHaveClass("text-yellow-500");
  });
});