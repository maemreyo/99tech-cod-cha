import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../test/test-utils";
import TokenSelector from "../TokenSelector";
import type { Token } from "../../types";

// Mock antd components
vi.mock("antd", () => {
  const Select = function Select(props) {
    return (
      <div className={props.className} data-testid="select">
        <input 
          placeholder={props.placeholder} 
          disabled={props.disabled}
          data-testid="select-input"
        />
        {props.children}
      </div>
    );
  };
  
  Select.Option = function Option({ children, value }) {
    return <div data-testid={`option-${value}`} data-value={value}>{children}</div>;
  };
  
  return {
    Select,
    Avatar: function Avatar({ children }) { 
      return <div data-testid="avatar">{children}</div>; 
    },
    Input: function Input({ placeholder, value, onChange }) {
      return (
        <input
          data-testid="input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      );
    },
    Empty: {
      PRESENTED_IMAGE_SIMPLE: "simple"
    }
  };
});

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe("TokenSelector", () => {
  const mockTokens: Token[] = [
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { id: "usdc", symbol: "USDC", name: "USD Coin" },
  ];

  const mockOnChange = vi.fn();

  it("renders with tokens", () => {
    render(
      <TokenSelector
        value=""
        onChange={mockOnChange}
        tokens={mockTokens}
      />
    );

    // Check if the component renders
    expect(screen.getByTestId("select-input")).toBeInTheDocument();
    
    // Check if tokens are rendered
    mockTokens.forEach(token => {
      expect(screen.getByTestId(`option-${token.symbol}`)).toBeInTheDocument();
    });
  });

  it("displays selected token", () => {
    render(
      <TokenSelector
        value="ETH"
        onChange={mockOnChange}
        tokens={mockTokens}
      />
    );

    // Check if the selected token is displayed
    expect(screen.getByTestId("option-ETH")).toHaveAttribute("data-value", "ETH");
  });

  it("excludes specified token", () => {
    render(
      <TokenSelector
        value=""
        onChange={mockOnChange}
        tokens={mockTokens}
        excludeToken="ETH"
      />
    );

    // ETH should be excluded
    expect(screen.queryByTestId("option-ETH")).not.toBeInTheDocument();
    
    // Other tokens should be present
    expect(screen.getByTestId("option-BTC")).toBeInTheDocument();
    expect(screen.getByTestId("option-USDC")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(
      <TokenSelector
        value=""
        onChange={mockOnChange}
        tokens={mockTokens}
        disabled={true}
      />
    );

    // Check if the component is disabled
    expect(screen.getByTestId("select-input")).toBeDisabled();
  });

  it("shows error state", () => {
    render(
      <TokenSelector
        value=""
        onChange={mockOnChange}
        tokens={mockTokens}
        error={true}
      />
    );

    // Check if error class is applied
    const selector = screen.getByTestId("select");
    expect(selector).toHaveClass("token-selector-dropdown");
    expect(selector).toHaveClass("error");
  });
});