import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Simula entorno donde localStorage.setItem lanza (quota / deshabilitado) y verifica que la app no rompe.

describe('AuthForm storage resilience', () => {
  const originalSetItem = window.localStorage.setItem;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Mock setItem para lanzar excepción (salvo para llamadas específicas si necesitamos permitir)
    window.localStorage.setItem = vi.fn(() => { throw new Error('QuotaExceeded'); }) as any;
  });

  test('app sigue funcionando aunque setItem lance errores', async () => {
    render(<AuthForm debugNoDelay debugFastHash />);

    // Intentar cambiar modo (se intenta persistir LAST_MODE_KEY)
    fireEvent.click(screen.getByRole('button', { name: /Regístrate/i }));
    // Completar registro rápido
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'storUser' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: 'stor@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    expect(await screen.findByText(/Registro creado exitosamente\./i)).toBeInTheDocument();

    // Cambiar a login y loguear
    fireEvent.click(screen.getByRole('button', { name: /Inicia sesión/i }));
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'storUser' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    // Verificar que la sesión aparece (botón Extender)
    expect(await screen.findByRole('button', { name: /Extender sesión/i })).toBeInTheDocument();
  });

  // Restaurar setItem
  afterAll(() => {
    window.localStorage.setItem = originalSetItem;
  });
});
