export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/unit/**/*.test.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
