import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AuthForm from '../components/AuthForm';
import { registerFast, loginFast, ensureSessionPanel, flush } from './testUtils/auth';

describe('AuthFlow logout', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('logout vuelve al formulario login y cancela expiración', async () => {
    vi.useFakeTimers();
    const base = Date.now();
    const nowRef = { current: base };
    const nowFn = () => nowRef.current;

    render(<AuthForm debugSessionDurationMs={3000} debugNow={nowFn} debugNoDelay debugFastHash />);

    // Registro + login
    registerFast({ username: 'logoutUser', email: 'logout@example.com', password: 'Abcdef1!' });
    // Cambiar a login y autenticar
    fireEvent.click(screen.getByRole('button', { name: /Inicia sesión/i }));
    loginFast({ identifier: 'logoutUser', password: 'Abcdef1!' });

    await ensureSessionPanel();

    // Logout
  fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }));
    // Flush re-render y timers micro
    for (let i = 0; i < 4; i++) { // eslint-disable-line no-await-in-loop
      await act(async () => { await flush(1); });
    }
    expect(await screen.findByText(/Sesión cerrada\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    // Avanzar tiempo más allá de la expiración original para asegurar que NO aparece mensaje de expiración
    for (let i = 0; i < 20; i++) { // 20 * 250 = 5000ms > 3000ms margen adicional
      nowRef.current += 250;
      act(() => { vi.advanceTimersByTime(250); });
      // eslint-disable-next-line no-await-in-loop
      await act(async () => { await flush(2); });
    }

    expect(screen.queryByText(/Sesión expirada\./i)).toBeNull();
  });
});
