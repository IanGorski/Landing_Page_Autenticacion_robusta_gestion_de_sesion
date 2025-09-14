import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

import AuthForm from '../components/AuthForm';

describe('AuthForm mode switching', () => {
    test('switches from login to register and back', () => {
        render(<AuthForm />);
        // Comienza en modo login (Predeterminado)
        expect(screen.getByRole('heading', { name: /hello again/i })).toBeInTheDocument();
        const toRegister = screen.getByRole('button', { name: /regístrate/i });
        fireEvent.click(toRegister);
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
        const toLogin = screen.getByRole('button', { name: /inicia sesión/i });
        fireEvent.click(toLogin);
        expect(screen.getByRole('heading', { name: /hello again/i })).toBeInTheDocument();
    });
});
