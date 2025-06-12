import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDebounce from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial value", 500));
    expect(result.current).toBe("initial value");
  });

  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial value", delay: 500 },
      }
    );

    // Initial value should be returned immediately
    expect(result.current).toBe("initial value");

    // Update the value
    rerender({ value: "updated value", delay: 500 });

    // Value should not have changed yet
    expect(result.current).toBe("initial value");

    // Fast-forward time by 250ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Value should still not have changed
    expect(result.current).toBe("initial value");

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Now the value should have updated
    expect(result.current).toBe("updated value");
  });

  it("should handle multiple rapid updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial value", delay: 500 },
      }
    );

    // Update the value multiple times rapidly
    rerender({ value: "update 1", delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: "update 2", delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: "final update", delay: 500 });

    // Value should still be the initial value
    expect(result.current).toBe("initial value");

    // Fast-forward time to complete the debounce
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Only the last update should be applied
    expect(result.current).toBe("final update");
  });
});