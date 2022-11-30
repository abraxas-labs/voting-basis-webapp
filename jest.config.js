/*
 * override default tsConfig setting of jest-preset-angular
 * https://github.com/thymikee/jest-preset-angular/blob/v7.1.1/jest-preset.js
 * Waiting for this Issue to be resolved
 * https://github.com/thymikee/jest-preset-angular/issues/286
 */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: true,
      stringifyContentPathRegex: '\\.html$',
    },
  },
};
