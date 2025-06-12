import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import SubmitButton from "../SubmitButton";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

describe("SubmitButton", () => {
  it("renders correctly when form is valid", () => {
    render(
      <SubmitButton
        isFormValid={true}
        isSwapping={false}
        fromToken="ETH"
        toToken="BTC"
        fromAmount="1"
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Swap Tokens");
  });
  
  it("is disabled when form is invalid", () => {
    render(
      <SubmitButton
        isFormValid={false}
        isSwapping={false}
        fromToken="ETH"
        toToken="BTC"
        fromAmount="1"
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
  
  it("shows loading state when swapping", () => {
    render(
      <SubmitButton
        isFormValid={true}
        isSwapping={true}
        fromToken="ETH"
        toToken="BTC"
        fromAmount="1"
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });
  
  it("shows 'Select tokens' when tokens are not selected", () => {
    render(
      <SubmitButton
        isFormValid={false}
        isSwapping={false}
        fromToken=""
        toToken=""
        fromAmount="1"
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Select tokens");
  });
  
  it("shows 'Enter an amount' when amount is empty", () => {
    render(
      <SubmitButton
        isFormValid={false}
        isSwapping={false}
        fromToken="ETH"
        toToken="BTC"
        fromAmount=""
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Enter an amount");
  });
  
  it("shows 'Enter valid amount' when amount is zero or negative", () => {
    render(
      <SubmitButton
        isFormValid={false}
        isSwapping={false}
        fromToken="ETH"
        toToken="BTC"
        fromAmount="0"
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Enter valid amount");
  });
  
  it("shows 'Insufficient balance' when amount exceeds balance", () => {
    render(
      <SubmitButton
        isFormValid={false}
        isSwapping={false}
        fromToken="ETH"
        toToken="BTC"
        fromAmount="20"
        tokenBalances={{ ETH: 10, BTC: 0.5 }}
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Insufficient balance");
  });
});