import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionPanel from '../components/SessionPanel';

const baseSession = {
  username: 'alice',
  email: 'alice@example.com',
  ts: Date.now(),
  expiresAt: Date.now() + 60000,
  duration: 60000,
};

const history = [
  { username: 'alice', email: 'alice@example.com', ts: Date.now() - 10000 },
  { username: 'bob', email: 'bob@example.com', ts: Date.now() - 20000 },
];

describe('SessionPanel', () => {
  test('renders session info and triggers callbacks', () => {
    const onExtend = vi.fn();
    const onLogout = vi.fn();
    const onRegisterAnother = vi.fn();

    render(
      <SessionPanel
        session={baseSession}
        history={history}
        remainingMs={25000}
        warn={true}
        onExtend={onExtend}
        onLogout={onLogout}
        onRegisterAnother={onRegisterAnother}
        greeting="Buenas tardes"
        formatRemaining={() => '00:25'}
        hashColor={() => 'hsl(0 0% 50%)'}
        initials={(n) => n[0].toUpperCase()}
      />
    );

    expect(screen.getByText(/alice \(alice@example.com\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Últimos inicios/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Extender sesión/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }));
    fireEvent.click(screen.getByRole('button', { name: /Crear otra cuenta/i }));
    expect(onExtend).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
    expect(onRegisterAnother).toHaveBeenCalled();
  });
});
