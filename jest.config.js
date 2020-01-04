module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  automock: false,
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'text', 'html'],
};
