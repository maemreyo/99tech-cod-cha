# Testing Documentation

This project uses a comprehensive testing setup with Vitest for unit and integration tests, and Playwright for end-to-end testing.

## Testing Stack

- **Vitest**: Fast unit and integration testing
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: End-to-end testing

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### End-to-End Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

## Test Structure

### Unit Tests

Unit tests are located next to the files they test in `__tests__` directories.

Example:
- `src/components/Button.tsx`
- `src/components/__tests__/Button.test.tsx`

### Integration Tests

Integration tests test the interaction between multiple components and are also located in `__tests__` directories.

### E2E Tests

End-to-end tests are located in the `e2e` directory at the project root.

## Mocking

### API Mocking with MSW

API calls are mocked using Mock Service Worker (MSW). Mock handlers are defined in `src/test/mocks/handlers.ts`.

Example of a mock handler:

```typescript
http.get('*/api/tokens', () => {
  return HttpResponse.json([
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  ]);
})
```

## Test Utilities

### Custom Render Function

A custom render function is provided in `src/test/test-utils.tsx` that wraps components with necessary providers (like React Query's QueryClientProvider).

Example usage:

```typescript
import { render, screen } from '../../test/test-utils';
import MyComponent from '../MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it.
2. **Use Data-Testid Sparingly**: Prefer using accessible queries like `getByRole`, `getByText`, etc.
3. **Mock External Dependencies**: Use MSW to mock API calls and other external dependencies.
4. **Keep Tests Fast**: Unit tests should be fast and focused.
5. **Test Edge Cases**: Test error states, loading states, and edge cases.
6. **Avoid Testing Implementation Details**: Don't test internal state or methods directly.
7. **Use Test Isolation**: Each test should be independent of others.

## Coverage

Run `pnpm test:coverage` to generate a coverage report. The report will be available in the `coverage` directory.