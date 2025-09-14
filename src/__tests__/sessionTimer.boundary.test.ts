import { describe, test, expect, vi } from 'vitest';

import { startSessionTimer } from '../utils/sessionTimer';

// Prueba de límite: cuando el tiempo restante es exactamente igual al umbral de advertencia, debe establecer warn=true

describe('startSessionTimer boundary', () => {
  test('warn flips when remaining equals threshold', () => {
    vi.useFakeTimers();
    const base = 1_000_000; // fixed base time
    let nowVal = base;
    const warnThreshold = 30_000;
    // La sesión expira ligeramente por encima del umbral para poder observar la transición
    const session = { expiresAt: base + warnThreshold + 50 }; // +50ms margin

    const ticks: Array<{ remaining: number; warn: boolean }> = [];
    const stop = startSessionTimer({
      getSession: () => session,
      now: () => nowVal,
      warnThresholdMs: warnThreshold,
      intervalMs: 10,
      onTick: (r, w) => { ticks.push({ remaining: r, warn: w }); },
      onExpire: () => {}
    });

    // Avanzar hasta cruzar exactamente el umbral
    // Sabemos que el restante inicial = warnThreshold + 50.
    // Avanzaremos el tiempo en pasos de 10ms y ejecutaremos los timers en cada paso.
    while ((session.expiresAt - nowVal) > warnThreshold) {
      nowVal += 10;
      vi.advanceTimersByTime(10);
    }

    // En este punto, remaining <= threshold, aseguramos que ocurrió un tick reflejando warn=true
    // Ejecutamos un ciclo más para asegurar el tick después de cruzar el umbral
    vi.advanceTimersByTime(10);
    nowVal += 10;

    stop();
    vi.useRealTimers();

    const warnPoint = ticks.find(t => t.remaining <= warnThreshold);
    expect(warnPoint).toBeTruthy();
    expect(warnPoint?.warn).toBe(true);
    const warnIndex = ticks.indexOf(warnPoint!);
    if (warnIndex > 0) {
      const prev = ticks[warnIndex - 1];
      expect(prev.remaining).toBeGreaterThan(warnThreshold);
      expect(prev.warn).toBe(false);
    }
  });
});
