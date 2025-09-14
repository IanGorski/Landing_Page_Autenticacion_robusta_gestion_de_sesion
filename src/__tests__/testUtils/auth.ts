import { screen, fireEvent, act } from '@testing-library/react';

// Pequeño helper para forzar flush de microtareas / re-renders en bucles controlados
export async function flush(times = 1) {
  for (let i = 0; i < times; i++) { // eslint-disable-line no-await-in-loop
    await Promise.resolve();
  }
}

// Registro rápido en modo register (asume que partimos en modo login y cambia a register)
export function registerFast({ username, email, password }: { username: string; email: string; password: string }) {
  const toRegister = screen.getByRole('button', { name: /Regístrate/i });
  fireEvent.click(toRegister);
  fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: username } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /Register/i }));
}

// Login rápido (asume modo login). Si estamos en modo register, cambia primero.
export function loginFast({ identifier, password }: { identifier: string; password: string }) {
  const toLogin = screen.queryByRole('button', { name: /Inicia sesión/i });
  if (toLogin) fireEvent.click(toLogin); // Cambia a login si procede
  fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: identifier } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
}

// Espera hasta que el SessionPanel esté presente identificando el botón de extensión (por aria-label accesible)
export async function ensureSessionPanel(maxLoops = 12) {
  let extendBtn: HTMLElement | null = null;
  for (let i = 0; i < maxLoops && !extendBtn; i++) { // eslint-disable-line no-await-in-loop
    await act(async () => { await flush(1); });
    extendBtn = screen.queryByRole('button', { name: /Extender sesión/i });
  }
  if (!extendBtn) throw new Error('Session panel no detectado (no se encontró botón Extender sesión).');
  return extendBtn;
}

// Lee remainingMs desde el wrapper del countdown
export function getRemainingMs(): number | null {
  const wrapper = document.querySelector('[data-component="SessionPanel"] .session-countdown-wrapper');
  if (!wrapper) return null;
  return parseInt(wrapper.getAttribute('data-remaining-ms') || '0', 10);
}

// Avanza tiempo simulado actualizando referencia de now + timers fake
export async function advance(nowRef: { current: number }, ms: number, advanceFn: (n: number) => void, flushCycles = 1) {
  nowRef.current += ms;
  act(() => { advanceFn(ms); });
  await act(async () => { await flush(flushCycles); });
}
