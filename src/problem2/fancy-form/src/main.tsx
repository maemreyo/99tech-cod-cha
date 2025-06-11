import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import App from "./App";
import "./index.css";

// Ant Design theme configuration
const customTheme = {
  token: {
    colorPrimary: "#a855f7",
    colorInfo: "#a855f7",
    borderRadius: 12,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },
  algorithm: theme.defaultAlgorithm,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider theme={customTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
