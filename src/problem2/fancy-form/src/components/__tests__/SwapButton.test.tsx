import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import SwapButton from '../SwapButton';

describe('SwapButton', () => {
  it('renders correctly', () => {
    const onSwap = vi.fn();
    render(<SwapButton onSwap={onSwap} disabled={false} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
  
  it('calls onSwap when clicked', async () => {
    const onSwap = vi.fn();
    const { user } = render(<SwapButton onSwap={onSwap} disabled={false} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(onSwap).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    const onSwap = vi.fn();
    render(<SwapButton onSwap={onSwap} disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});