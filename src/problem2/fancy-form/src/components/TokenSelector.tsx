import React, { useState, useMemo } from "react";
import { Select, Input, Avatar, Empty, Spin } from "antd";
import { SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import type { Token } from "../types";

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  tokens: Token[];
  excludeToken?: string;
  error?: boolean;
  disabled?: boolean;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  value,
  onChange,
  tokens,
  excludeToken,
  error,
  disabled,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Filter tokens based on search query and exclusion
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (token.symbol === excludeToken) return false;
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name?.toLowerCase().includes(query)
      );
    });
  }, [tokens, excludeToken, searchQuery]);

  // Get selected token data
  const selectedToken = tokens.find((t) => t.symbol === value);

  // Handle image load errors
  const handleImageError = (symbol: string): boolean => {
    setImageErrors((prev) => new Set(prev).add(symbol));
    return true; // Return true to prevent default fallback behavior
  };

  // Get token icon URL with fallback
  const getTokenIcon = (symbol: string) => {
    if (imageErrors.has(symbol)) {
      return null;
    }
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
  };

  // Render token option
  const renderTokenOption = (token: Token) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-4">
        <Avatar
          size={36}
          src={getTokenIcon(token.symbol)}
          onError={() => handleImageError(token.symbol)}
          style={{ backgroundColor: "#f0f0f0" }}
        >
          {token.symbol.charAt(0)}
        </Avatar>
        <div>
          <div className="font-semibold">{token.symbol}</div>
          {token.name && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {token.name}
            </div>
          )}
        </div>
      </div>
      {value === token.symbol && (
        <CheckCircleOutlined className="text-primary" />
      )}
    </div>
  );

  return (
    <Select
      value={value}
      styles={{
        popup: {
          root: {
            padding: 0,
            minWidth: 200,
          },
        },
      }}
      onChange={onChange}
      disabled={disabled}
      placeholder="Select token"
      className={`token-selector-dropdown ${error ? "error" : ""}`}
      style={{ minWidth: 180 }}
      optionLabelProp="label"
      showSearch={false}
      listItemHeight={60}
      listHeight={320}
      popupMatchSelectWidth={false}
      popupRender={(menu) => (
        <div>
          <div className="p-3 border-b">
            <Input
              placeholder="Search token"
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-auto">
            {filteredTokens.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tokens found"
                className="py-8"
              />
            ) : (
              menu
            )}
          </div>
        </div>
      )}
    >
      {filteredTokens.map((token) => (
        <Select.Option
          key={token.symbol}
          value={token.symbol}
          label={
            <div className="flex items-center gap-3">
              <Avatar
                size={24}
                src={getTokenIcon(token.symbol)}
                onError={() => handleImageError(token.symbol)}
                style={{ backgroundColor: "#f0f0f0" }}
              >
                {token.symbol.charAt(0)}
              </Avatar>
              <span className="font-medium">{token.symbol}</span>
            </div>
          }
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {renderTokenOption(token)}
          </motion.div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default TokenSelector;
