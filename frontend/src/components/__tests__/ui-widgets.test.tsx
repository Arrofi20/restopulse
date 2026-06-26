// Tests for Spinner, RefreshButton, EmptyState — TDD RED phase.
// Source: 02-05-PLAN.md Task 1 <behavior> tests 1-5.
//
// Verifies:
//   Test 1: Spinner renders a spinning indicator (CSS animate-spin)
//   Test 2: RefreshButton renders a clickable button that calls onClick handler
//   Test 3: RefreshButton shows spinning state when loading prop is true
//   Test 4: EmptyState renders the Indonesian message and CTA button
//   Test 5: EmptyState CTA button is clickable and calls onClick handler

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Spinner } from '../ui/Spinner';
import { RefreshButton } from '../ui/RefreshButton';
import { EmptyState } from '../dashboard/EmptyState';

describe('Spinner', () => {
  it('Test 1: Spinner renders an animated spinning indicator', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('RefreshButton', () => {
  it('Test 2: renders a clickable button that calls onClick handler', () => {
    const onClick = vi.fn();
    render(<RefreshButton onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /Segarkan/i });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Test 3: shows spinning state when loading prop is true', () => {
    const onClick = vi.fn();
    render(<RefreshButton onClick={onClick} loading={true} />);
    const btn = screen.getByRole('button');
    // Disabled while loading (D-11)
    expect(btn).toBeDisabled();
    // Text switches to "Memperbarui..." (D-11)
    expect(screen.getByText(/Memperbarui/i)).toBeInTheDocument();
    // A spinner (animate-spin) is rendered inside the button (D-12)
    expect(btn.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('Test 4: renders the Indonesian message and CTA button', () => {
    render(<EmptyState onAddData={() => {}} />);
    // Exact message from D-09
    expect(
      screen.getByText(/Belum ada data penjualan untuk periode ini/i)
    ).toBeInTheDocument();
    // CTA button (D-09)
    expect(
      screen.getByRole('button', { name: /Tambah Data/i })
    ).toBeInTheDocument();
  });

  it('Test 4b: hides the CTA button when onAddData is not provided', () => {
    render(<EmptyState />);
    // Message still present
    expect(
      screen.getByText(/Belum ada data penjualan untuk periode ini/i)
    ).toBeInTheDocument();
    // No CTA button
    expect(screen.queryByRole('button', { name: /Tambah Data/i })).toBeNull();
  });

  it('Test 5: CTA button is clickable and calls onClick handler', () => {
    const onAddData = vi.fn();
    render(<EmptyState onAddData={onAddData} />);
    fireEvent.click(screen.getByRole('button', { name: /Tambah Data/i }));
    expect(onAddData).toHaveBeenCalledTimes(1);
  });
});
