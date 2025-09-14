import { describe, test, expect, vi } from 'vitest';

import { startSessionTimer } from '../utils/sessionTimer';

describe('startSessionTimer', () => {
    test('ticks, warns, and expires', () => {
        vi.useFakeTimers();
        const createdAt = 1_000_000;
        let now = createdAt;
        const duration = 5000; // 5s
        const session = { expiresAt: createdAt + duration };

        const events: Array<{ remaining: number; warn: boolean; type: 'tick' | 'expire' }> = [];

        const stop = startSessionTimer({
            getSession: () => session,
            now: () => now,
            warnThresholdMs: 2000,
            intervalMs: 1000,
            onTick: (remaining, warn) => events.push({ remaining, warn, type: 'tick' }),
            onExpire: () => events.push({ remaining: 0, warn: false, type: 'expire' })
        });

        // Verifica que se haya llamado al menos una vez (tick inicial)
        expect(events.length).toBeGreaterThan(0);

        // Avanza 3 segundos en el temporizador
        for (let i = 0; i < 3; i++) {
            now += 1000;
            vi.advanceTimersByTime(1000);
        }

        // Avanza otros 3 segundos, cruzando el umbral de advertencia (<2000ms)
        for (let i = 0; i < 3; i++) {
            now += 1000;
            vi.advanceTimersByTime(1000);
        }

        // El último evento debe ser de expiración
        expect(events[events.length - 1].type).toBe('expire');

        // Debe haber al menos un tick con advertencia
        const hasWarn = events.some(e => e.type === 'tick' && e.warn);
        expect(hasWarn).toBe(true);

        // Detiene el temporizador y restaura los temporizadores reales
        stop();
        vi.useRealTimers();
    });
});
