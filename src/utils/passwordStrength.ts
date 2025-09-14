export interface CriteriaState {
  len6: boolean;
  len10: boolean;
  upper: boolean;
  digit: boolean;
  symbol: boolean;
}

export interface StrengthResult {
  score: number;
  label: string;
  criteria: CriteriaState;
}

const labels = ['Muy débil','Débil','Aceptable','Buena','Fuerte','Excelente'];

export function evaluatePasswordStrength(pw: string): StrengthResult {
  if (!pw) {
    return { score: 0, label: '', criteria: { len6:false,len10:false,upper:false,digit:false,symbol:false } };
  }
  const criteria: CriteriaState = {
    len6: pw.length >= 6,
    len10: pw.length >= 10,
    upper: /[A-Z]/.test(pw),
    digit: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw)
  };
  const score = Object.values(criteria).filter(Boolean).length;
  const label = labels[score] || 'Excelente';
  return { score, label, criteria };
}

export function criteriaToProgress(score: number): number {
  return (score / 5) * 100;
}
