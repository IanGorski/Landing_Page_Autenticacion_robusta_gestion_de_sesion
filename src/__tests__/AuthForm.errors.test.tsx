import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

function switchToRegister() {
  const btn = screen.queryByRole('button', { name: /Regístrate/i });
  if (btn) fireEvent.click(btn);
}

function ensureLoginMode() {
  // Si existe botón "Inicia sesión", significa que estamos en modo register y necesitamos ir a login.
  const toLogin = screen.queryByRole('button', { name: /Inicia sesión/i });
  if (toLogin) fireEvent.click(toLogin);
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('AuthForm edge/error cases', () => {
  test('invalid email shows error', async () => {
    render(<AuthForm debugNoDelay debugFastHash />);
    switchToRegister();
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'userx' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    expect(await screen.findByText(/Email inválido/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mínimo 6 caracteres/i)).toBeInTheDocument();
  });

  test('login with wrong credentials shows error', async () => {
    render(<AuthForm debugNoDelay debugFastHash />);
    ensureLoginMode();
    // Confirmamos que el botón submit corresponde a login (Sign In) si es posible.
    const submitBtn = screen.getAllByRole('button').find(btn => (btn as HTMLButtonElement).type === 'submit');
    // Rellenar campos y enviar.
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'nouser' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn!);
    // Esperar mensaje de credenciales inválidas.
    expect(await screen.findByText(/Credenciales inválidas o usuario no registrado\./i)).toBeInTheDocument();
  });
});
