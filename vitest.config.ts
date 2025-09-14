import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  // Temporarily enable full default reporter summary for debugging failing tests
  reporters: ["default"],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        '**/testUtils/**',
        '**/*.d.ts'
      ],
      // Thresholds iniciales conservadores: ajusta después de ver baseline real.
      thresholds: {
        lines: 0, // actualizar tras baseline
        branches: 0,
        functions: 0,
        statements: 0
      }
    }
  }
});
