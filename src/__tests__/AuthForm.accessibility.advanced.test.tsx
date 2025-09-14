import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Accesibilidad avanzada: secuencia de enfoque y alternancia de aria-invalid

describe('AuthForm accessibility advanced', () => {
  test('sets aria-invalid on invalid required fields after submit', async () => {
    render(<AuthForm debugNoDelay />);

    // Enviar el formulario de inicio de sesión vacío para activar la validación de usuario/contraseña
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    const username = screen.getByLabelText(/Username o Email/i);
    await screen.findByText(/Username requerido/i);
    expect(username).toHaveAttribute('aria-invalid', 'true');

    // Cambiar a registro y enviar vacío para activar la validación de email y confirmación
    fireEvent.click(screen.getByRole('button', { name: /Regístrate/i }));
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    await screen.findByText(/Email requerido/i);

    const email = screen.getByRole('textbox', { name: /^Email$/i });
    expect(email).toHaveAttribute('aria-invalid', 'true');
    const confirm = screen.getByLabelText(/Confirm Password/i);
    expect(confirm).toHaveAttribute('aria-invalid', 'true');
  });
});
