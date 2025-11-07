export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};