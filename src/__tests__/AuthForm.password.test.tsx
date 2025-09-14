import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

import AuthForm from '../components/AuthForm';

describe('AuthForm password strength', () => {
// Verifica que el medidor de fortaleza de contraseña se actualiza al escribir en modo registro
test('updates strength meter when typing password in register mode', () => {
    render(<AuthForm />);
    // Cambia a modo registro
    fireEvent.click(screen.getByRole('button', { name: /regístrate/i }));
    // Usa el label anclado para evitar coincidir con el campo de confirmación
    const pwInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(pwInput, { target: { value: 'Ab1!' } });
    // El label de fortaleza aparece con el prefijo "Fortaleza:"
    expect(screen.getByText(/fortaleza:/i)).toBeInTheDocument();
});
});
