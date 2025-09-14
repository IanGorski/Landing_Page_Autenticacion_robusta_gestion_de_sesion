import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Comprobaciones básicas de presencia de accesibilidad (no es una auditoría a11y exhaustiva)

describe('AuthForm accessibility', () => {
  test('renders form landmarks and live regions', () => {
    render(<AuthForm />);

    // Form fields
    expect(screen.getByLabelText(/Username o Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Mode switch link
    expect(screen.getByRole('button', { name: /Regístrate|Inicia sesión/i })).toBeInTheDocument();

    // Providers group
    const providersGroup = screen.getByRole('group', { name: /Proveedores de identidad/i });
    expect(providersGroup).toBeInTheDocument();

    // Toast region (aria-live polite container)
    const livePolite = screen.getAllByRole('generic', { hidden: true }).find(el => el.getAttribute('aria-live') === 'polite');
    expect(livePolite).toBeTruthy();
  });
});
