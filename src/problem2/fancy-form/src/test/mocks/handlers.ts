import { http, HttpResponse } from "msw";

// Sample token data for testing
const mockTokens = [
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3500,
    price_change_percentage_24h: 2.5,
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 60000,
    price_change_percentage_24h: 1.8,
  },
];

// Define handlers for API endpoints
export const handlers = [
  // Handler for fetching tokens
  http.get("*/api/tokens", () => {
    return HttpResponse.json(mockTokens);
  }),

  // Handler for token balances
  http.get("*/api/balances", () => {
    return HttpResponse.json({
      ethereum: "1.5",
      bitcoin: "0.05",
    });
  }),

  // Handler for swap calculations
  http.post("*/api/swap/calculate", async ({ request }) => {
    const data = await request.json();
    const { fromToken, toToken, amount } = data as any;

    // Simple mock calculation
    let toAmount = 0;
    if (fromToken === "ethereum" && toToken === "bitcoin") {
      toAmount = parseFloat(amount) * (3500 / 60000);
    } else if (fromToken === "bitcoin" && toToken === "ethereum") {
      toAmount = parseFloat(amount) * (60000 / 3500);
    }

    return HttpResponse.json({
      fromAmount: amount,
      toAmount: toAmount.toString(),
      exchangeRate: fromToken === "ethereum" ? 3500 / 60000 : 60000 / 3500,
      fee: (parseFloat(amount) * 0.003).toString(),
    });
  }),

  // Handler for executing swaps
  http.post("*/api/swap/execute", async () => {
    return HttpResponse.json({
      success: true,
      transactionId: "mock-tx-" + Math.random().toString(36).substring(2, 10),
    });
  }),
];
