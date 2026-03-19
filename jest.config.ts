import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['jest-canvas-mock', '<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|mjs)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json', allowJs: true }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^react-native$': '<rootDir>/node_modules/react-native-web',
    '^phaser$': '<rootDir>/src/__mocks__/phaserMock.ts',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/src/**/?(*.)(test|spec).(js|jsx|ts|tsx)',
  ],
  transformIgnorePatterns: ['node_modules/(?!(uuid|eventemitter3|react-native|react-native-web|@react-native)/)'],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/index.tsx', '!src/reportWebVitals.ts'],
};

export default config;
