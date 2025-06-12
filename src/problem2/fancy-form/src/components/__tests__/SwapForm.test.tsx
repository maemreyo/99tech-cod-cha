import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../test/test-utils";
import SwapForm from "../SwapForm";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  ArrowUpDown: () => <div data-testid="arrow-updown-icon" />,
}));

// Mock antd components
vi.mock("antd", () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  Modal: ({ children, open }) => (open ? <div>{children}</div> : null),
  Select: ({ children }) => <div>{children}</div>,
  Avatar: ({ children }) => <div data-testid="avatar">{children}</div>,
  Input: ({ children, ...props }) => <input {...props}>{children}</input>,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

// Mock child components
vi.mock("../FromTokenSection", () => ({
  __esModule: true,
  default: () => <div data-testid="from-token-section">From Token Section</div>,
}));

vi.mock("../ToTokenSection", () => ({
  __esModule: true,
  default: () => <div data-testid="to-token-section">To Token Section</div>,
}));

vi.mock("../SwapButton", () => ({
  __esModule: true,
  default: () => <div data-testid="swap-button">Swap Button</div>,
}));

vi.mock("../SwapSummary", () => ({
  __esModule: true,
  default: () => <div data-testid="swap-summary">Swap Summary</div>,
}));

vi.mock("../SubmitButton", () => ({
  __esModule: true,
  default: () => <div data-testid="submit-button">Submit Button</div>,
}));

vi.mock("../ConfirmationModal", () => ({
  __esModule: true,
  default: () => <div data-testid="confirmation-modal">Confirmation Modal</div>,
}));

// Mock the hooks and services
vi.mock("../../hooks/useTokenData", () => ({
  useTokenList: () => ({
    data: [
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        image: "https://example.com/eth.png",
      },
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        image: "https://example.com/btc.png",
      },
    ],
    isLoading: false,
  }),
  useTokenPrices: () => ({
    data: {
      ethereum: { usd: 3500 },
      bitcoin: { usd: 60000 },
    },
    isLoading: false,
  }),
}));

vi.mock("../../hooks/useTokenBalances", () => ({
  __esModule: true,
  default: () => ({
    tokenBalances: {
      ethereum: 1.5,
      bitcoin: 0.05,
    },
    updateBalances: vi.fn(),
  }),
}));

// Mock react-hook-form
vi.mock("react-hook-form", () => {
  return {
    useForm: () => ({
      control: {
        register: vi.fn(),
        unregister: vi.fn(),
        getFieldState: vi.fn(),
        _names: {
          array: new Set(),
          mount: new Set(),
          unMount: new Set(),
          watch: new Set(),
          focus: "",
          watchAll: false,
        },
        _subjects: {
          watch: { next: vi.fn() },
          array: { next: vi.fn() },
          state: { next: vi.fn() },
        },
        _getWatch: vi.fn(),
        _formValues: {},
        _defaultValues: {},
      },
      handleSubmit: vi.fn(),
      formState: { errors: {} },
      reset: vi.fn(),
      getValues: vi.fn().mockReturnValue({
        fromToken: "ethereum",
        toToken: "bitcoin",
        fromAmount: "1",
      }),
      setValue: vi.fn(),
      trigger: vi.fn(),
    }),
    Controller: ({ render }) => render({ field: { onChange: vi.fn(), value: "", name: "" } }),
  };
});

vi.mock("../../hooks/useSwapForm", () => ({
  __esModule: true,
  default: () => ({
    control: {
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      _names: {
        array: new Set(),
        mount: new Set(),
        unMount: new Set(),
        watch: new Set(),
        focus: "",
        watchAll: false,
      },
      _subjects: {
        watch: { next: vi.fn() },
        array: { next: vi.fn() },
        state: { next: vi.fn() },
      },
      _getWatch: vi.fn(),
      _formValues: {},
      _defaultValues: {},
    },
    handleSubmit: (fn) => (e) => {
      e?.preventDefault?.();
      fn({ fromToken: "ethereum", toToken: "bitcoin", fromAmount: "1" });
    },
    errors: {},
    reset: vi.fn(),
    fromToken: "ethereum",
    toToken: "bitcoin",
    fromAmount: "1",
    handleAmountChange: vi.fn(),
    handleSwapTokens: vi.fn(),
    handleMaxClick: vi.fn(),
    isFormValid: true,
    trigger: vi.fn(),
  }),
}));

vi.mock("../../hooks/useSwapCalculations", () => ({
  __esModule: true,
  default: () => ({
    exchangeRate: 0.058,
    toAmount: "0.058",
    priceImpact: 0.1,
  }),
}));

vi.mock("../../services/swapService", () => ({
  swapTokens: vi.fn().mockResolvedValue({ success: true }),
}));

describe("SwapForm Component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with title and subtitle", () => {
    render(<SwapForm />);
    
    // Check if key elements are rendered
    expect(screen.getByText(/swap tokens/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/trade tokens instantly/i, { exact: false })).toBeInTheDocument();
  });
});