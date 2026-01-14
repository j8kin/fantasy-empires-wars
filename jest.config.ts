import { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/__tests__/**/*.(test|spec).(ts|tsx)'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx)', '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx)'],
};

export default config;
