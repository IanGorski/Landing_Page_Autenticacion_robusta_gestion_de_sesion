import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Cobertura de umbrales de fuerza de contraseña para asegurar asignación correcta de labels
// Criterios: len6, len10, upper, digit, symbol => score = count true, label indexado.

// Mapa interno en evaluatePasswordStrength: labels = [ 'Muy débil','Débil','Aceptable','Buena','Fuerte','Excelente' ]
// score = número de criterios cumplidos (0..5)
// Construimos casos que activan incrementalmente los criterios en el orden (len6,len10,upper,digit,symbol)
// OJO: El orden de activación real no importa para el score; solo debemos garantizar cantidad.
const cases = [
  { pw: 'a', expectScore: 0, expectLabel: 'Muy débil' }, // 0 criterios => label[0]
  { pw: 'abcdef', expectScore: 1, expectLabel: 'Débil' }, // len6
  { pw: 'ABCDEFG', expectScore: 2, expectLabel: 'Aceptable' }, // len6 + upper
  { pw: 'ABCDEF1', expectScore: 3, expectLabel: 'Buena' }, // + digit
  { pw: 'ABCDEF1!', expectScore: 4, expectLabel: 'Fuerte' }, // + symbol
  { pw: 'ABCDEFGHI1!', expectScore: 5, expectLabel: 'Fuerte' }, // + len10 (score=5 -> label debe ser 'Excelente', se corrige abajo)
];

// Ajustar última entrada: con 5 criterios score=5 => label = 'Excelente'
cases[cases.length - 1].expectLabel = 'Excelente';

describe('Password strength boundaries', () => {
  test.each(cases)('pw=%s produce score/label esperados', ({ pw, expectScore, expectLabel }) => {
    render(<AuthForm debugNoDelay debugFastHash />);
  // Si estamos en modo login, aparecerá un texto alternativo con botón "Regístrate"
  const toRegister = screen.queryByRole('button', { name: /Regístrate/i });
  if (toRegister) fireEvent.click(toRegister);
    const pwInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(pwInput, { target: { value: pw } });
    // El componente PasswordStrengthMeter debería reflejar label (si label vacío, no mostrar)
    expect(screen.getByText(new RegExp(expectLabel, 'i'))).toBeInTheDocument();
  });
});
