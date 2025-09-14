import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

import AuthForm from '../components/AuthForm';

// NOTA: Esta prueba simula una duración de sesión acelerada modificando directamente el estado a través del flujo de inicio de sesión.
// Como la duración de la sesión se selecciona mediante la interfaz, mantenemos el valor predeterminado y luego adelantamos los temporizadores simulando Date.

describe('AuthForm session basic flow', () => {
  test('register then login shows countdown pill', async () => {
    render(<AuthForm debugSessionDurationMs={60000} debugNoDelay debugDisableFeedback />);
    fireEvent.click(screen.getByRole('button', { name: /regístrate/i }));
    fireEvent.change(screen.getByLabelText(/username o email/i), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'demo@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await screen.findByText(/registro creado/i);
    fireEvent.click(screen.getByRole('button', { name: /inicia sesión/i }));
    fireEvent.change(screen.getByLabelText(/username o email/i), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    // Espera a que aparezca el encabezado de la vista de sesión
    await screen.findByRole('heading', { name: /buenas tardes|buenos dias|buenas noches/i });
    const countdownWrapper = screen.getByLabelText(/tiempo restante de sesión/i);
    expect(countdownWrapper.querySelector('.countdown-pill')?.textContent).toMatch(/\d{2}:\d{2}/);
  });
});
