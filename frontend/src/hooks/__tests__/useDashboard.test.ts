// Tests for useDashboard hook — TDD RED phase.
// Source: 02-04-PLAN.md Task 1 <behavior> tests 4-6.
//
// Verifies:
//   Test 4: fetches GET /api/dashboard?start=&end= on mount and on dateRange change
//   Test 5: updates loading/error/data states correctly
//   Test 6: refresh() triggers manual re-fetch
//
// Real timers are used here: the 30s polling interval never fires during a
// sub-second test, and waitFor needs real microtask flushing to observe the
// async fetch state transitions.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDashboard } from '../useDashboard';
import { get } from '../../api/client';

vi.mock('../../api/client', () => ({
  get: vi.fn(),
}));

describe('useDashboard', () => {
  beforeEach(() => {
    vi.mocked(get).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockDateRange = { start: '2026-06-01', end: '2026-06-08' };

  const mockApiResponse = {
    success: true,
    data: {
      outlet: { name: 'Resto Utama' },
      trends: [],
      summary: { totalRevenue: 1500000, transactionCount: 42 },
    },
  };

  it('Test 4: fetches GET /api/dashboard?start=&end= on mount and on dateRange change', async () => {
    vi.mocked(get).mockResolvedValue(mockApiResponse);

    const { rerender } = renderHook(({ dr }: { dr: typeof mockDateRange }) => useDashboard(dr), {
      initialProps: { dr: mockDateRange },
    });

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/dashboard?start=2026-06-01&end=2026-06-08');
    });

    // Change the date range → hook must re-fetch with the new params
    const nextRange = { start: '2026-06-09', end: '2026-06-15' };
    rerender({ dr: nextRange });

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/dashboard?start=2026-06-09&end=2026-06-15');
    });
  });

  it('Test 5: updates loading/error/data states correctly', async () => {
    vi.mocked(get).mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useDashboard(mockDateRange));

    // Initially loading, no data, no error
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // After the async fetch resolves, loading flips false and data is set
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual(mockApiResponse.data);
    expect(result.current.error).toBeNull();
  });

  it('Test 6: refresh() triggers manual re-fetch', async () => {
    vi.mocked(get).mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useDashboard(mockDateRange));

    // Wait for the initial mount fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = vi.mocked(get).mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(0);

    // Manual refresh must trigger a new GET with the same date range.
    // Wrapped in act() because refresh() synchronously flips loading -> true.
    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(vi.mocked(get).mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    const lastCall = vi.mocked(get).mock.calls[vi.mocked(get).mock.calls.length - 1];
    expect(lastCall[0]).toBe('/dashboard?start=2026-06-01&end=2026-06-08');
  });

  it('Test 5b: sets error state when the fetch rejects', async () => {
    vi.mocked(get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDashboard(mockDateRange));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
