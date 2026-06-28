module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/index.ts'],
  // The pure core (state machine, measurement, path math) is held to a high bar.
  // The React layer gets component + E2E coverage in later weeks (RN preset + jsdom).
  coverageThreshold: {
    './src/engine/machine.ts': { lines: 95, branches: 85, functions: 100 },
    './src/overlay/paths.ts': { lines: 95, branches: 85, functions: 100 },
    './src/overlay/position.ts': { lines: 95, branches: 85, functions: 100 },
    './src/measure.ts': { lines: 95, branches: 85, functions: 100 },
  },
};
