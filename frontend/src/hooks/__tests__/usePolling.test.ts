// Tests for usePolling hook — TDD RED phase.
// Source: 02-04-PLAN.md Task 1 <behavior> tests 1-3.
//
// Verifies:
//   Test 1: calls fetchFn immediately on mount, then every intervalMs thereafter
//   Test 2: pauses interval when document.hidden becomes true, resumes when false
//   Test 3: clears interval on unmount (no memory leak)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from '../usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom defaults to document.hidden = false; ensure a clean baseline.
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Test 1: calls fetchFn immediately on mount, then every intervalMs thereafter', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    renderHook(() => usePolling(fetchFn, 1000));

    // Immediate call on mount
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // After 1 interval → second call
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    // After another interval → third call
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('Test 2: pauses interval when document.hidden becomes true, resumes when false', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    renderHook(() => usePolling(fetchFn, 1000));

    // Initial mount call
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Hide tab — visibilitychange must pause the interval
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    // Advance 3 intervals — no further calls while hidden
    await vi.advanceTimersByTimeAsync(3000);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Show tab — resume triggers an immediate fetch
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(fetchFn).toHaveBeenCalledTimes(2);

    // Subsequent interval fires normally after resume
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('Test 3: clears interval on unmount (no memory leak)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() => usePolling(fetchFn, 1000));

    expect(fetchFn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    unmount();

    // After unmount, advancing time must not trigger more fetches —
    // the interval was cleared in the effect cleanup.
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
