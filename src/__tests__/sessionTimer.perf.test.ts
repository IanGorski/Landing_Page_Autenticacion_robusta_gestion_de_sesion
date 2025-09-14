import { describe, test, expect, vi } from 'vitest';
import { startSessionTimer } from '../utils/sessionTimer';

describe('sessionTimer performance', () => {
  test('handles many rapid ticks efficiently', () => {
    vi.useFakeTimers();
    const base = 1_000_000;
    let now = base;
    const duration = 5000; // 5s
    const session = { expiresAt: base + duration };
    const ticks: number[] = [];

    startSessionTimer({
      getSession: () => session,
      now: () => now,
      warnThresholdMs: 2000,
      intervalMs: 10,
      onTick: (remaining) => { ticks.push(remaining); },
      onExpire: () => { /* no-op */ }
    });

    for (let i = 0; i < duration; i += 10) {
      now += 10;
      vi.advanceTimersByTime(10);
    }

    // Debería tener aproximadamente duration/interval ticks
    expect(ticks.length).toBeGreaterThan(400);
    vi.useRealTimers();
  });
});
