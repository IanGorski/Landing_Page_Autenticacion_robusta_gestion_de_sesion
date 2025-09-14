import { describe, test, expect } from 'vitest';
import { evaluatePasswordStrength } from '../utils/passwordStrength';

// Prueba de micro-benchmark (no verifica tiempos estrictos, solo asegura que se ejecute suficientemente rápido)

describe('evaluatePasswordStrength performance', () => {
  test('runs many evaluations under a loose time budget', () => {
    const samples = [
      'abc',
      'Abcdef1',
      'Abcdef1!',
      'CorrectHorseBatteryStaple123!',
      'P@55w0rdP@55w0rdP@55w0rd',
    ];
    const iterations = 5000;
    const start = performance.now();
    let agg = 0;
    for (let i = 0; i < iterations; i++) {
      const s = samples[i % samples.length];
      const res = evaluatePasswordStrength(s);
      agg += res.score;
    }
    const duration = performance.now() - start;
    // Umbral generoso arbitrario (debería estar muy por debajo en máquinas de desarrollo típicas)
    expect(duration).toBeLessThan(1000);
    // Usar agg para que el bucle no sea optimizado
    expect(agg).toBeGreaterThan(0);
  });
});
