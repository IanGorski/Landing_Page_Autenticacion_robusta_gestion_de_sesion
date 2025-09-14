import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

function registerFast(user: string, email: string, password: string) {
  fireEvent.click(screen.getByRole('button', { name: /Regístrate/i }));
  fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: user } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /Register/i }));
}

async function flush(times = 2) { for (let i = 0; i < times; i++) { // eslint-disable-next-line no-await-in-loop
  await Promise.resolve(); } }

async function ensureSessionPanel() {
  let extendBtn: HTMLElement | null = null;
  for (let i = 0; i < 10 && !extendBtn; i++) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => { await flush(1); });
    extendBtn = screen.queryByRole('button', { name: /Extender sesión/i });
  }
  if (!extendBtn) throw new Error('Session panel not detected (no Extender button).');
  return extendBtn;
}

describe('AuthFlow extend session', () => {
  test('extend increases remainingMs (resets countdown)', async () => {
    vi.useFakeTimers();
    const base = Date.now();
    let now = base;
    const nowFn = () => now;
    render(<AuthForm debugSessionDurationMs={4000} debugNow={nowFn} debugNoDelay debugFastHash />);

    // Registrarse y obtener el toast de éxito rápidamente
    registerFast('extUser', 'ext@example.com', 'Abcdef1!');
    // Cambiar a la vista de inicio de sesión
    fireEvent.click(screen.getByRole('button', { name: /Inicia sesión/i }));
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'extUser' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await ensureSessionPanel();

    // Avanzar 2000ms (la mitad de 4000)
    now += 2000; act(() => { vi.advanceTimersByTime(2000); });
    await act(async () => { await flush(1); });

    const wrapper = document.querySelector('[data-component="SessionPanel"] .session-countdown-wrapper');
    if (!wrapper) throw new Error('Countdown wrapper not found');
    const remainingBefore = parseInt(wrapper.getAttribute('data-remaining-ms') || '0', 10);
    expect(remainingBefore).toBeGreaterThan(1500); // Should be somewhat near 2000 but allow some tick drift
    expect(remainingBefore).toBeLessThan(4000);

    // Hacer clic en extender
    fireEvent.click(screen.getByRole('button', { name: /Extender sesión/i }));

    // Después de extender, el tiempo restante debería volver cerca de la duración completa (4000)
    let remainingAfter = 0;
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => { await flush(1); });
      const w = document.querySelector('[data-component="SessionPanel"] .session-countdown-wrapper');
      remainingAfter = parseInt(w?.getAttribute('data-remaining-ms') || '0', 10);
      if (remainingAfter > remainingBefore + 500) break; // detect jump
    }
    expect(remainingAfter).toBeGreaterThan(remainingBefore); // Countdown reset
    expect(remainingAfter).toBeGreaterThan(3000); // Should be near full duration again

    // Deja que expire después de la nueva duración completa
    const targetAdvance = 5000; // > 4000ms new duration
    for (let elapsed = 0; elapsed <= targetAdvance; elapsed += 250) {
      now += 250; act(() => { vi.advanceTimersByTime(250); });
      // eslint-disable-next-line no-await-in-loop
      await act(async () => { await flush(1); });
      const expired = screen.queryByText(/Sesión expirada\./i);
      if (expired) { expect(expired).toBeInTheDocument(); return; }
    }
    throw new Error('Session did not expire after extension window elapsed');
  });
});
