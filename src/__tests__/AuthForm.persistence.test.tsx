import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Persistencia: preferencia de duración y historial almacenados/recuperados

describe('AuthForm persistence', () => {
  test('stores session duration selection for future sessions', async () => {
    localStorage.clear();
    sessionStorage.clear();
    render(<AuthForm debugNoDelay />);

    // Cambiar duración a 10 minutos
    const select = screen.getByLabelText(/Duración sesión/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: String(10 * 60 * 1000) } });

    // Registrar y flujo de inicio de sesión rápidamente
    fireEvent.click(screen.getByRole('button', { name: /Regístrate/i }));
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'alpha' } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: 'alpha@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcdef1!' } });
  fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  // Esperar el toast de éxito (async setTimeout 0)
  await screen.findByText(/Registro creado exitosamente/i);
  await screen.findByText(/Registro creado exitosamente/i);

    // Cambiar a modo login usando el botón existente (rol button, no tab)
    const toLogin = screen.getByRole('button', { name: /Inicia sesión/i });
    fireEvent.click(toLogin);
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'alpha' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
  const submitBtn = screen.getAllByRole('button').find(btn => (btn as HTMLButtonElement).type === 'submit');
  fireEvent.click(submitBtn!);
  // En lugar de esperar el toast, verifica que el panel de sesión (nombre de usuario visible) esté presente
  await screen.findByText(/alpha \(/i);

    // Historial almacenado
    const historyRaw = localStorage.getItem('auth-demo-history');
    expect(historyRaw).toBeTruthy();
    const history = JSON.parse(historyRaw!);
    expect(Array.isArray(history)).toBe(true);
    expect(history[0].username).toBe('alpha');

    // Duración almacenada
    const storedDuration = localStorage.getItem('auth-session-duration');
    expect(Number(storedDuration)).toBe(10 * 60 * 1000);
  });
});
