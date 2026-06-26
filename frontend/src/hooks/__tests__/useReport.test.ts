// Tests for useReport hook — mirrors useDashboard.test.ts (Plan 03-02 Task 1).
//
// Verifies:
//   Test 1: fetches GET /api/report?start=&end= on mount
//   Test 2: updates loading/error/data states correctly
//   Test 3: refresh() triggers manual re-fetch
//   Test 4: sets error state when the fetch rejects
//
// Real timers are used here: the 30s polling interval never fires during a
// sub-second test, and waitFor needs real microtask flushing to observe the
// async fetch state transitions.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useReport } from '../useReport';
import { get } from '../../api/client';

vi.mock('../../api/client', () => ({
  get: vi.fn(),
}));

describe('useReport', () => {
  beforeEach(() => {
    vi.mocked(get).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockDateRange = { start: '2026-06-01', end: '2026-06-30' };

  const mockApiResponse = {
    success: true,
    data: {
      outlet: { name: 'Resto Utama' },
      period: { start: '2026-06-01', end: '2026-06-30' },
      summary: { totalRevenue: 1500000, transactionCount: 21, topItems: ['Nasi Goreng', 'Es Teh', 'Ayam Bakar'] },
      rows: [
        { date: '2026-06-01', revenue: 50000, topMenu: 'Nasi Goreng', transactionCount: 1 },
      ],
    },
  };

  it('Test 1: fetches GET /api/report?start=&end= on mount', async () => {
    vi.mocked(get).mockResolvedValue(mockApiResponse);

    renderHook(() => useReport(mockDateRange));

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/report?start=2026-06-01&end=2026-06-30');
    });
  });

  it('Test 2: updates loading/error/data states correctly', async () => {
    vi.mocked(get).mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useReport(mockDateRange));

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

  it('Test 3: refresh() triggers manual re-fetch', async () => {
    vi.mocked(get).mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useReport(mockDateRange));

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
    expect(lastCall[0]).toBe('/report?start=2026-06-01&end=2026-06-30');
  });

  it('Test 4: sets error state when the fetch rejects', async () => {
    vi.mocked(get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useReport(mockDateRange));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
