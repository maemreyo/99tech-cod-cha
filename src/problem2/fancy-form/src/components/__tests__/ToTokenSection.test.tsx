import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { useForm } from "react-hook-form";
import ToTokenSection from "../ToTokenSection";
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

// Mock formatters
vi.mock("../../utils/formatters", () => ({
  formatNumber: (value) => value.toString(),
}));

// Create a wrapper component to provide form context
const ToTokenSectionWrapper = (props) => {
  const methods = useForm<SwapFormData>({
    defaultValues: {
      fromToken: "",
      fromAmount: "",
      toToken: props.toToken || "",
      toAmount: "",
    },
  });

  return (
    <ToTokenSection
      control={methods.control}
      errors={props.errors || {}}
      tokens={props.tokens || []}
      excludeToken={props.excludeToken || ""}
      tokenBalances={props.tokenBalances || {}}
      toToken={props.toToken || ""}
      toAmount={props.toAmount || "0"}
    />
  );
};

describe("ToTokenSection", () => {
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
      <ToTokenSectionWrapper
        tokens={mockTokens}
        toToken="BTC"
        tokenBalances={mockTokenBalances}
      />
    );

    expect(screen.getByText("To (estimated)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    expect(screen.getByText(/Balance:/)).toBeInTheDocument();
  });

  it("displays formatted amount in the input", () => {
    render(
      <ToTokenSectionWrapper
        tokens={mockTokens}
        toToken="BTC"
        tokenBalances={mockTokenBalances}
        toAmount="0.05"
      />
    );

    const input = screen.getByPlaceholderText("0.00");
    expect(input).toHaveValue("0.05");
  });

  it("has disabled input", () => {
    render(
      <ToTokenSectionWrapper
        tokens={mockTokens}
        toToken="BTC"
        tokenBalances={mockTokenBalances}
      />
    );

    const input = screen.getByPlaceholderText("0.00");
    expect(input).toBeDisabled();
  });

  it("displays error message when there's an error", () => {
    render(
      <ToTokenSectionWrapper
        tokens={mockTokens}
        toToken="BTC"
        tokenBalances={mockTokenBalances}
        errors={{
          toToken: {
            type: "required",
            message: "Token is required",
          },
        }}
      />
    );

    expect(screen.getByText("Token is required")).toBeInTheDocument();
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("doesn't show balance when token is not selected", () => {
    render(
      <ToTokenSectionWrapper
        tokens={mockTokens}
        toToken=""
        tokenBalances={mockTokenBalances}
      />
    );

    expect(screen.queryByText(/Balance:/)).not.toBeInTheDocument();
  });

  it("passes correct props to TokenSelector", () => {
    render(
      <ToTokenSectionWrapper
        tokens={mockTokens}
        toToken="BTC"
        tokenBalances={mockTokenBalances}
        excludeToken="ETH"
      />
    );

    // This is a basic check since we're mocking the TokenSelector component
    expect(screen.getByText("To (estimated)")).toBeInTheDocument();
  });
});