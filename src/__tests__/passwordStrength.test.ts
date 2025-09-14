import { describe, test, expect } from 'vitest';
import { evaluatePasswordStrength } from '../utils/passwordStrength';

describe('password strength evaluation', () => {
  test('empty password returns score 0 and empty label', () => {
    const r = evaluatePasswordStrength('');
    expect(r.score).toBe(0);
    expect(r.label).toBe('');
  });

  test('criteria accumulation path', () => {
    const steps: Array<[string, number]> = [
      ['abcdef', 1], // len6
      ['Abcdef', 2], // + mayúscula
      ['Abcdef1', 3], // + dígito
      ['Abcdef1!', 4], // + símbolo
      ['Abcdefgh1!', 5] // + len10
    ];
    for (const [pw, expectedScore] of steps) {
      const r = evaluatePasswordStrength(pw);
      expect(r.score).toBe(expectedScore);
      if (expectedScore === 0) expect(r.label).toBe(''); else expect(r.label).not.toBe('');
    }
  });
});