import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Prueba: intentar registrar un usuario duplicado (mismo username) debe mostrar error
// y no permitir login posterior usando un email alternativo no registrado.

function goToRegister() {
  const btn = screen.getByRole('button', { name: /Regístrate/i });
  fireEvent.click(btn);
}

async function register({ username, email, password }: { username: string; email: string; password: string }) {
  goToRegister();
  fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: username } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  // Esperar toast de éxito
  expect(await screen.findByText(/Registro creado exitosamente\./i)).toBeInTheDocument();
}

describe('AuthForm duplicate user registration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('second registration with same username shows duplicate error and does not create new account', async () => {
    render(<AuthForm debugNoDelay debugFastHash />);

    // Registro inicial
    await register({ username: 'dupUser', email: 'dup@example.com', password: 'Abcdef1!' });

    // Intento duplicado: mismo username, distinto email
    // (seguimos en modo register tras el éxito anterior)
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'dupUser' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Email$/i }), { target: { value: 'dup2@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Debe aparecer error de duplicado
    expect(await screen.findByText(/Ya existe un usuario con ese username o email\./i)).toBeInTheDocument();

    // Cambiar a login y verificar que el usuario original puede iniciar sesión
    fireEvent.click(screen.getByRole('button', { name: /Inicia sesión/i }));
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'dupUser' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    // Aparece el panel de sesión (username visible o acción Extender)
    expect(await screen.findByRole('button', { name: /Extender sesión/i })).toBeInTheDocument();

    // Logout para volver al formulario
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }));
    expect(await screen.findByText(/Sesión cerrada\./i)).toBeInTheDocument();

    // Intentar login usando el email alternativo que no debió registrarse
    fireEvent.change(screen.getByLabelText(/Username o Email/i), { target: { value: 'dup2@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText(/Credenciales inválidas o usuario no registrado\./i)).toBeInTheDocument();
  });
});
