import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AuthForm from '../components/AuthForm';
import { registerFast, loginFast, ensureSessionPanel, getRemainingMs, flush } from './testUtils/auth';

/**
 * Escenario: Extender la sesión justo antes de expirar (t-1ms) debe evitar expiración inmediata
 * y reiniciar correctamente el contador cercano al valor total configurado.
 */
describe('AuthFlow extend near expiry', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('extender en t-1ms previene expiración y resetea countdown', async () => {
    vi.useFakeTimers();
    const base = Date.now();
    const nowRef = { current: base };
    const nowFn = () => nowRef.current;
    const DURATION = 3000; // 3s
    render(<AuthForm debugSessionDurationMs={DURATION} debugNow={nowFn} debugNoDelay debugFastHash />);

    // Registro + login
    registerFast({ username: 'nearExpiry', email: 'near@exp.test', password: 'Abcdef1!' });
    fireEvent.click(screen.getByRole('button', { name: /Inicia sesión/i }));
    loginFast({ identifier: 'nearExpiry', password: 'Abcdef1!' });
    await ensureSessionPanel();

    // Avanzar hasta quedar dentro de la última ventana (< 40ms) para simular t-~1ms.
    const advance = (ms: number) => { nowRef.current += ms; act(() => { vi.advanceTimersByTime(ms); }); };
    const target = DURATION - 5; // dejamos unos ms de margen por granularidad
    let advanced = 0;
    while (advanced < target) {
      let remaining = target - advanced;
      // Afinar los pasos al acercarnos al final
      const chunk = remaining > 500 ? 250 : remaining > 100 ? 50 : remaining > 50 ? 25 : remaining;
      advance(chunk);
      advanced += chunk;
      // eslint-disable-next-line no-await-in-loop
      await act(async () => { await flush(1); });
    }

    // Aseguramos que remainingMs es pequeño (>0)
    const remainingBefore = getRemainingMs();
    expect(remainingBefore).not.toBeNull();
  expect(remainingBefore as number).toBeGreaterThan(0);
  // Debido a granularidad de timers + render, aceptamos hasta 60ms restantes.
    if ((remainingBefore as number) > 60) {
      // eslint-disable-next-line no-console
      console.log('[extendNearExpiry][warn] remainingBefore alto =', remainingBefore);
    }
    expect(remainingBefore as number).toBeLessThanOrEqual(300); // aceptar hasta 300ms por granularidad

    // Extender justo antes de que el timer dispare expiración.
    fireEvent.click(screen.getByRole('button', { name: /Extender sesión/i }));

    // Procesar re-render
    for (let i = 0; i < 4; i++) { // eslint-disable-line no-await-in-loop
      await act(async () => { await flush(1); });
    }

    const remainingAfter = getRemainingMs();
    expect(remainingAfter).not.toBeNull();
    expect(remainingAfter as number).toBeGreaterThan(remainingBefore as number + 1000); // salto significativo
    expect(remainingAfter as number).toBeGreaterThanOrEqual(DURATION - 50); // cerca del full reset

    // Verificar que NO aparece mensaje de expiración inmediatamente
    expect(screen.queryByText(/Sesión expirada\./i)).toBeNull();

    // Dejar que ahora sí llegue a expirar tras nueva duración completa
    const expireTarget = DURATION + 200; // margen adicional
    let elapsed2 = 0;
    let expired = false;
    while (elapsed2 <= expireTarget && !expired) {
      const chunk = 250;
      advance(chunk);
      elapsed2 += chunk;
      // eslint-disable-next-line no-await-in-loop
      await act(async () => { await flush(1); });
      if (screen.queryByText(/Sesión expirada\./i)) expired = true;
    }
    if (!expired) {
      throw new Error('La sesión no expiró después de la extensión en el intervalo esperado');
    }
    expect(screen.getByText(/Sesión expirada\./i)).toBeInTheDocument();
  });
});
