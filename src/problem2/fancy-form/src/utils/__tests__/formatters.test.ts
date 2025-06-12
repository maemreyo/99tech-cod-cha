import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatLargeNumber,
  formatUSD,
  calculateExchangeAmount,
  calculatePriceImpact,
  sanitizeNumericInput,
  parseNumericString,
  formatPercentage,
  shortenAddress,
  timeAgo,
  debounce,
} from '../formatters';

describe('formatNumber', () => {
  it('formats numbers with auto decimal places', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1.23456)).toBe('1.23');
    expect(formatNumber(0.0123456)).toBe('0.0123');
    expect(formatNumber(0.0000123456)).toBe('0.000012');
  });

  it('formats numbers with specified decimal places', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    expect(formatNumber(1234.5678, 0)).toBe('1,235');
    expect(formatNumber(1234.5678, 4)).toBe('1,234.5678');
  });
});

describe('formatLargeNumber', () => {
  it('formats large numbers with abbreviations', () => {
    expect(formatLargeNumber(1234)).toBe('1.23K');
    expect(formatLargeNumber(1234567)).toBe('1.23M');
    expect(formatLargeNumber(1234567890)).toBe('1.23B');
    expect(formatLargeNumber(123)).toBe('123');
  });
});

describe('formatUSD', () => {
  it('formats numbers as USD currency', () => {
    expect(formatUSD(1234.56)).toBe('$1,234.56');
    expect(formatUSD(0)).toBe('$0.00');
    expect(formatUSD(1000000)).toBe('$1,000,000.00');
  });
});

describe('calculateExchangeAmount', () => {
  it('calculates exchange amount based on rate', () => {
    expect(calculateExchangeAmount(100, 1.5)).toBe(150);
    expect(calculateExchangeAmount(0, 1.5)).toBe(0);
    expect(calculateExchangeAmount(100, 0)).toBe(0);
  });
});

describe('calculatePriceImpact', () => {
  it('calculates price impact percentage', () => {
    expect(calculatePriceImpact(100, 95, 1)).toBe(5);
    expect(calculatePriceImpact(100, 105, 1)).toBe(5);
    expect(calculatePriceImpact(0, 0, 0)).toBe(0);
  });
});

describe('sanitizeNumericInput', () => {
  it('sanitizes numeric input', () => {
    expect(sanitizeNumericInput('123.45')).toBe('123.45');
    expect(sanitizeNumericInput('123abc')).toBe('123');
    expect(sanitizeNumericInput('123.45.67')).toBe('123.4567');
    expect(sanitizeNumericInput('01.23')).toBe('1.23');
    expect(sanitizeNumericInput('0.123')).toBe('0.123');
  });
});

describe('parseNumericString', () => {
  it('parses numeric string to number', () => {
    expect(parseNumericString('123.45')).toBe(123.45);
    expect(parseNumericString('abc')).toBe(0);
    expect(parseNumericString('123abc')).toBe(123);
  });
});

describe('formatPercentage', () => {
  it('formats percentage values', () => {
    expect(formatPercentage(0.05)).toBe('5%');
    expect(formatPercentage(0.05, 1)).toBe('5%');
    expect(formatPercentage(0.0512, 2)).toBe('5.12%');
  });
});

describe('shortenAddress', () => {
  it('shortens addresses for display', () => {
    expect(shortenAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
    expect(shortenAddress('0x1234567890abcdef1234567890abcdef12345678', 6)).toBe('0x123456...345678');
    expect(shortenAddress('0x1234')).toBe('0x1234');
  });
});

describe('timeAgo', () => {
  it('formats time ago strings', () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    expect(timeAgo(now)).toBe('Just now');
    expect(timeAgo(oneMinuteAgo)).toBe('1m ago');
    expect(timeAgo(oneHourAgo)).toBe('1h ago');
    expect(timeAgo(oneDayAgo)).toBe('1d ago');
  });
});

describe('debounce', () => {
  it('debounces function calls', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    expect(callCount).toBe(0);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(callCount).toBe(1);
  });
});