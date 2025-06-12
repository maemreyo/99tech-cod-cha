import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { useForm } from "react-hook-form";
import FromTokenSection from "../FromTokenSection";
import type { Token } from "../../types";
import type { SwapFormData } from "../../types";

// Mock react-hook-form
vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  return {
    ...actual,
    useForm: () => ({
      control: { _defaultValues: { fromToken: "", fromAmount: "", toToken: "" } },
      formState: { errors: {} },
    }),
    Controller: ({ render, control, name }) => {
      const { field } = { field: { value: control?._defaultValues?.[name] || "", onChange: vi.fn() } };
      return render({ field });
    },
  };
});

// Mock lucide-react
vi.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alert-icon" />,
}));

// Create a wrapper component to provide form context
const FromTokenSectionWrapper = (props) => {
  const methods = useForm<SwapFormData>({
    defaultValues: {
      fromToken: props.fromToken || "",
      fromAmount: "",
      toToken: "",
      toAmount: "",
    },
  });

  return (
    <FromTokenSection
      control={methods.control}
      errors={props.errors || {}}
      tokens={props.tokens || []}
      excludeToken={props.excludeToken || ""}
      tokenBalances={props.tokenBalances || {}}
      fromToken={props.fromToken || ""}
      handleAmountChange={props.handleAmountChange || vi.fn()}
      handleMaxClick={props.handleMaxClick || vi.fn()}
      trigger={props.trigger || vi.fn()}
    />
  );
};

describe("FromTokenSection", () => {
  const mockTokens: Token[] = [
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ];

  const mockTokenBalances = {
    ETH: 1.5,
    BTC: 0.05,
  };

  it("renders correctly with token balance", () => {
    render(
      <FromTokenSectionWrapper
        tokens={mockTokens}
        fromToken="ETH"
        tokenBalances={mockTokenBalances}
      />
    );

    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    expect(screen.getByText(/Balance:/)).toBeInTheDocument();
    expect(screen.getByText("MAX")).toBeInTheDocument();
  });

  it("renders input for amount", () => {
    const handleAmountChange = vi.fn();
    
    render(
      <FromTokenSectionWrapper
        tokens={mockTokens}
        fromToken="ETH"
        tokenBalances={mockTokenBalances}
        handleAmountChange={handleAmountChange}
      />
    );

    const input = screen.getByPlaceholderText("0.00");
    expect(input).toBeInTheDocument();
  });

  it("handles MAX button click", () => {
    const handleMaxClick = vi.fn();
    
    render(
      <FromTokenSectionWrapper
        tokens={mockTokens}
        fromToken="ETH"
        tokenBalances={mockTokenBalances}
        handleMaxClick={handleMaxClick}
      />
    );

    const maxButton = screen.getByText("MAX");
    maxButton.click();
    
    expect(handleMaxClick).toHaveBeenCalled();
  });

  it("displays error message when there's an error", () => {
    render(
      <FromTokenSectionWrapper
        tokens={mockTokens}
        fromToken="ETH"
        tokenBalances={mockTokenBalances}
        errors={{
          fromAmount: {
            type: "required",
            message: "Amount is required",
          },
        }}
      />
    );

    expect(screen.getByText("Amount is required")).toBeInTheDocument();
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("applies error class to input when there's an error", () => {
    render(
      <FromTokenSectionWrapper
        tokens={mockTokens}
        fromToken="ETH"
        tokenBalances={mockTokenBalances}
        errors={{
          fromAmount: {
            type: "required",
            message: "Amount is required",
          },
        }}
      />
    );

    const input = screen.getByPlaceholderText("0.00");
    expect(input).toHaveClass("input-error");
  });

  it("doesn't show balance when token is not selected", () => {
    render(
      <FromTokenSectionWrapper
        tokens={mockTokens}
        fromToken=""
        tokenBalances={mockTokenBalances}
      />
    );

    expect(screen.queryByText(/Balance:/)).not.toBeInTheDocument();
    expect(screen.queryByText("MAX")).not.toBeInTheDocument();
  });
});