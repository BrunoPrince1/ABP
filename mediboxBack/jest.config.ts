import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/db/migrate.ts', '!src/db/seed.ts', '!src/server.ts'],
};

export default config;
