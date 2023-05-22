
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**'
  ],
  coverageDirectory: './test-reports',
  coverageReporters: ['lcov'],
  moduleDirectories: [
    'node_modules',
    '<rootDir>'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-reports',
      suiteName: 'hsp-fo-cms'
    }]
  ],
  testMatch: [
    '**/test/**/*.spec.ts',
    '**/test/**/*.spec.tsx'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '@fontsource/*': '<rootDir>/test/testutils/fontMock.ts'
  }
}
