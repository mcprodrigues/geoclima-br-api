import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  moduleDirectories: ['node_modules', '<rootDir>/src'],

  transform: { '^.+\\.ts$': 'ts-jest' },
  clearMocks: true,
};

export default config;
