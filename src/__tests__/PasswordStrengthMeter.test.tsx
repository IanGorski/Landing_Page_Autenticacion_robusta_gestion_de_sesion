import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  test('renders criteria and label based on props', () => {
    render(
      <PasswordStrengthMeter
        strength={{ score: 3, label: 'Fuerte' }}
        criteria={{ len6: true, len10: false, upper: true, digit: true, symbol: false }}
      />
    );
    expect(screen.getByText(/Fortaleza: Fuerte/i)).toBeInTheDocument();
    expect(screen.getByText(/6\+ chars/i)).toBeInTheDocument();
  });

  test('returns null when no label', () => {
    const { container } = render(
      <PasswordStrengthMeter
        strength={{ score: 0, label: '' }}
        criteria={{ len6: false, len10: false, upper: false, digit: false, symbol: false }}
      />
    );
    expect(container.innerHTML).toBe('');
  });
});
