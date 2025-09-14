import { describe, test, expect, vi } from 'vitest';
import { startSessionTimer } from '../utils/sessionTimer';

// Asegura que warn=true inmediatamente cuando el tiempo restante es igual al umbral al inicio

describe('startSessionTimer exact threshold', () => {
  test('initial remaining == warnThreshold => warn true on first tick', () => {
    vi.useFakeTimers();
    const base = 2_000_000;
    const warnThreshold = 10_000;
    const session = { expiresAt: base + warnThreshold }; 
    let nowVal = base;

    const ticks: Array<{ remaining: number; warn: boolean }> = [];

    const stop = startSessionTimer({
      getSession: () => session,
      now: () => nowVal,
      warnThresholdMs: warnThreshold,
      intervalMs: 1000,
      onTick: (r, w) => ticks.push({ remaining: r, warn: w }),
      onExpire: () => {}
    });

    // No se ha avanzado el tiempo; el primer tick ya fue registrado
    expect(ticks.length).toBeGreaterThan(0);
    const first = ticks[0];
    expect(first.remaining).toBeLessThanOrEqual(warnThreshold);
    expect(first.warn).toBe(true);

    stop();
    vi.useRealTimers();
  });
});
