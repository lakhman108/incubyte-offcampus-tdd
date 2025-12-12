module.exports = {
  testEnvironment: 'node',
  roots: ['./src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage'

};
