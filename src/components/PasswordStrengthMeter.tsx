import React from 'react';

interface Criteria { len6: boolean; len10: boolean; upper: boolean; digit: boolean; symbol: boolean }
interface PwStrength { score: number; label: string }

interface PasswordStrengthMeterProps {
  strength: PwStrength;
  criteria: Criteria;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ strength, criteria }) => {
  if (!strength.label) return null;
  return (
    <div className="pw-meter" aria-live="polite">
      <div className="pw-bar" data-score={strength.score}>
        <span data-pw-width={strength.score} />
      </div>
      <div className="pw-label">Fortaleza: {strength.label}</div>
      <ul className="pw-criteria" aria-label="Criterios contraseña">
        <li className={criteria.len6 ? 'ok' : 'pending'}>{criteria.len6 ? '✓' : '•'} 6+ chars</li>
        <li className={criteria.upper ? 'ok' : 'pending'}>{criteria.upper ? '✓' : '•'} Mayúscula</li>
        <li className={criteria.len10 ? 'ok' : 'pending'}>{criteria.len10 ? '✓' : '•'} 10+ chars</li>
        <li className={criteria.digit ? 'ok' : 'pending'}>{criteria.digit ? '✓' : '•'} Número</li>
        <li className={criteria.symbol ? 'ok' : 'pending'}>{criteria.symbol ? '✓' : '•'} Símbolo</li>
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
