import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Comprobaciones básicas de "seguridad" (solo del lado del cliente, recordatorio)

describe('AuthForm security basics', () => {
  test('password input type stays password and value not echoed in DOM text', () => {
    render(<AuthForm debugNoDelay />);
    const pw = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    fireEvent.change(pw, { target: { value: 'SecretPass123!' } });
    expect(pw.type).toBe('password');
    // Asegúrate de que ningún nodo de texto visible muestre la contraseña en texto plano (escaneo simplista)
    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('SecretPass123!');
  });

  test('invalid login attempt does not create a session payload', async () => {
    render(<AuthForm debugNoDelay />);
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'ghost' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Wrong123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
  expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
    // sessionStorage no debe tener la clave
    expect(sessionStorage.getItem('auth-demo-session')).toBeNull();
  });
});
