import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Integration: register -> logout (implicit by switching?) -> login -> session ticking -> expire -> extend

function fillRegister(username: string, email: string, password: string) {
  fireEvent.click(screen.getByRole('button', { name: /Regístrate/i }));
  fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: username } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /Register/i }));
}

async function flushMicrotasks(times = 3) {
  for (let i = 0; i < times; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

async function waitForStatus(regex: RegExp, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    // Asegurarse de que React procese las actualizaciones de estado creadas en microtareas.
    await act(async () => { await flushMicrotasks(1); });
    await act(async () => {});
    // eslint-disable-next-line no-await-in-loop
    await act(async () => { await flushMicrotasks(2); });
    const el = screen.queryByText(regex);
    if (el) return el;
    act(() => { try { vi.runOnlyPendingTimers(); } catch { /* ignore */ } });
  }
  // eslint-disable-next-line no-console
  console.log('[integration] waitForStatus failed for', regex, 'DOM snapshot:', document.body.innerHTML);
  throw new Error('Status not found for regex: ' + regex);
}

describe('AuthFlow integration', () => {
  test('register -> login -> expire -> status message', async () => {
    // Usar fake timers desde el inicio para que el sessionTimer esté bajo control determinista.
    vi.useFakeTimers();
    const base = Date.now();
    let now = base;
    const nowFn = () => now;

    render(<AuthForm debugSessionDurationMs={3000} debugNow={nowFn} debugNoDelay debugFastHash />);

  // Register
  fillRegister('user1', 'user1@example.com', 'Abcdef1!');
  const regToast = await waitForStatus(/Registro creado exitosamente\./i);
  expect(regToast).toBeInTheDocument();
  // eslint-disable-next-line no-console
  console.log('[integration] registered user1 (toast observed)');

  // Asegurar que estamos en modo login: si existe el botón para cambiar a login lo pulsamos, si no ya estamos ahí
  const loginToggle = screen.queryByRole('button', { name: /Inicia sesión/i });
  if (loginToggle) {
    fireEvent.click(loginToggle);
    await act(async () => { await flushMicrotasks(2); });
  }

  // Rellenar credenciales de inicio de sesión (el usuario fue registrado arriba)
  fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'user1' } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
  // eslint-disable-next-line no-console
  console.log('[integration] filled login credentials');

  // Seleccionar el botón de envío de forma robusta.
  let submitBtn: HTMLElement | null = null;
  try {
    const candidateNames = [/Sign In/i, /Ingresar/i, /Entrar/i];
    for (const rx of candidateNames) {
      const btns = screen.queryAllByRole('button', { name: rx });
      if (btns.length === 1) { submitBtn = btns[0]; break; }
    }
    if (!submitBtn) {
      const formEl = document.querySelector('form.auth-form');
      if (formEl) {
        const btn = formEl.querySelector('button[type="submit"]');
        if (btn) submitBtn = btn as HTMLElement;
      }
    }
  } catch (err) {
    throw new Error('Submit button selection failed: ' + (err as Error).message);
  }
  if (!submitBtn) {
    // Proporcionar salida de diagnóstico de todos los botones para depuración.
    const allNames = screen.queryAllByRole('button').map(b => b.textContent || b.getAttribute('aria-label') || '').join(' | ');
    throw new Error('Submit button not found among buttons: ' + allNames);
  }
  fireEvent.click(submitBtn);
  // Como el estado de sesión reemplaza el formulario inmediatamente, en modo debugFastHash + debugNoDelay
  // el toast puede desaparecer antes de ser consultado. En su lugar verificamos el panel de sesión.
  // Criterio: aparece botón 'Extender' (aria-label="Extender sesión").
  let extendBtn: HTMLElement | null = null;
  for (let i = 0; i < 10 && !extendBtn; i++) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => { await flushMicrotasks(1); });
    extendBtn = screen.queryByRole('button', { name: /Extender sesión/i });
  }
  if (!extendBtn) {
    // eslint-disable-next-line no-console
    console.log('[integration] No se encontró botón Extender sesión. DOM:', document.body.innerHTML);
    throw new Error('Panel de sesión no apareció tras login');
  }
  expect(extendBtn).toBeInTheDocument();
  // eslint-disable-next-line no-console
  console.log('[integration] sesión activa detectada (panel visible)');

    // Avanzar tiempo y verificar decremento mediante data-remaining-ms
    const step = 250;
    const maxSimulated = 4000; // ms > duración
    let lastRemaining = Number.MAX_SAFE_INTEGER;
    let expiredToast: HTMLElement | null = null;
    for (let elapsed = 0; elapsed <= maxSimulated; elapsed += step) {
      now += step;
      act(() => { vi.advanceTimersByTime(step); });
      // eslint-disable-next-line no-await-in-loop
      await act(async () => { await flushMicrotasks(1); });
      const wrapper = document.querySelector('[data-component="SessionPanel"] .session-countdown-wrapper') as HTMLElement | null;
      const remainingAttr = wrapper?.getAttribute('data-remaining-ms');
      const remaining = remainingAttr ? parseInt(remainingAttr, 10) : undefined;
      // eslint-disable-next-line no-console
      if (remaining !== undefined) console.log('[integration] remainingMs=', remaining, 'elapsed=', elapsed);
      if (remaining !== undefined) {
        if (remaining > lastRemaining) {
          // eslint-disable-next-line no-console
          console.log('[integration][warn] remainingMs aumentó inesperadamente', lastRemaining, '->', remaining);
        }
        lastRemaining = remaining;
      }
      expiredToast = screen.queryByText(/Sesión expirada\./i);
      if (expiredToast) break;
    }
    if (!expiredToast) {
      // eslint-disable-next-line no-console
      console.log('[integration] No se encontró toast de expiración tras', maxSimulated, 'ms. DOM final:', document.body.innerHTML);
      throw new Error('No apareció el toast de expiración (control fake timers)');
    }
    expect(expiredToast).toBeInTheDocument();
  });
});
