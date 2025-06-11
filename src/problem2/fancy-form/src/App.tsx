import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import { Toaster } from "react-hot-toast";
import SwapForm from "./components/SwapForm";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check system preference and set initial theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: "#667eea",
            borderRadius: 16,
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      >
        <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
          <SwapForm />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: isDarkMode ? "#1a1f2e" : "#fff",
                color: isDarkMode ? "#fff" : "#1a1a1a",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              },
            }}
          />
        </div>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
