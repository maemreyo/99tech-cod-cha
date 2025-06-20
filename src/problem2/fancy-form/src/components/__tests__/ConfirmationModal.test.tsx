import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import ConfirmationModal from "../ConfirmationModal";
import type { SwapFormData } from "../../types";

// Mock antd Modal
vi.mock("antd", () => {
  const actual = vi.importActual("antd");
  return {
    ...actual,
    Modal: ({ children, title, open, onOk, onCancel, okText, cancelText }) => (
      open ? (
        <div data-testid="modal">
          <div data-testid="modal-title">{title}</div>
          <div data-testid="modal-content">{children}</div>
          <button data-testid="modal-ok" onClick={onOk}>{okText}</button>
          <button data-testid="modal-cancel" onClick={onCancel}>{cancelText}</button>
        </div>
      ) : null
    ),
    Divider: ({ className }) => <div data-testid="divider" className={className} />,
    Tooltip: ({ className, title }) => <div data-testid="tooltip" className={className} title={title} />,
  };
});

// Mock antd icons
vi.mock("@ant-design/icons", () => ({
  SwapOutlined: () => <div data-testid="swap-icon" />,
  InfoCircleOutlined: () => <div data-testid="info-circle-outlined-icon" />,
  DollarOutlined: () => <div data-testid="dollar-outlined-icon" />,
  
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  AlertCircle: ({ className, size }) => {
    // Add a unique identifier based on className to differentiate between instances
    const testId = className?.includes("text-red-500") 
      ? "alert-circle-warning-icon" 
      : "alert-circle-price-icon";
    return <div data-testid={testId} className={className} />;
  },
  Zap: ({ className, size }) => <div data-testid="zap-icon" className={className} />,
  ArrowDownCircle: ({ className, size }) => <div data-testid="arrow-down-icon" className={className} />,
  ArrowUpCircle: ({ className, size }) => <div data-testid="arrow-up-icon" className={className} />,
}));

// Mock formatters
vi.mock("../../utils/formatters", () => ({
  formatNumber: (value) => value.toString(),
}));

describe("ConfirmationModal", () => {
  const mockSwapData: SwapFormData = {
    fromToken: "ETH",
    toToken: "BTC",
    fromAmount: "1",
    toAmount: "0.05",
  };

  const defaultProps = {
    isOpen: true,
    isLoading: false,
    pendingSwapData: mockSwapData,
    toAmount: "0.05",
    exchangeRate: 0.05,
    priceImpact: 0.5,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders correctly with swap details", () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Confirm Swap");
    // Check for the presence of key UI elements instead of specific text
    expect(screen.getByTestId("arrow-up-icon")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-down-icon")).toBeInTheDocument();
    expect(screen.getByTestId("swap-icon")).toBeInTheDocument();
  });

  it("doesn't render when pendingSwapData is null", () => {
    render(<ConfirmationModal {...defaultProps} pendingSwapData={null} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("doesn't render when isOpen is false", () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("shows exchange rate information", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Exchange Rate")).toBeInTheDocument();
    expect(screen.getByText("1 ETH = 0.05 BTC")).toBeInTheDocument();
  });

  it("shows price impact when it's greater than 0.1%", () => {
    render(<ConfirmationModal {...defaultProps} priceImpact={0.5} />);
    expect(screen.getByText("Price Impact")).toBeInTheDocument();
    expect(screen.getByText("0.50%")).toBeInTheDocument();
  });

  it("doesn't show price impact when it's less than or equal to 0.1%", () => {
    render(<ConfirmationModal {...defaultProps} priceImpact={0.1} />);
    expect(screen.queryByText("Price Impact")).not.toBeInTheDocument();
  });

  it("shows warning for high price impact", () => {
    render(<ConfirmationModal {...defaultProps} priceImpact={4} />);
    expect(screen.getByTestId("alert-circle-warning-icon")).toBeInTheDocument();
    expect(screen.getByText(/High price impact/)).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    render(<ConfirmationModal {...defaultProps} />);
    screen.getByTestId("modal-ok").click();
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<ConfirmationModal {...defaultProps} />);
    screen.getByTestId("modal-cancel").click();
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});