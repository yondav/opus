import { config as dotenvConfig } from 'dotenv';
import type { Config } from 'jest';

dotenvConfig();

// Define directories to be ignored during testing.
const ignoreDirs = ['dist/', 'node_modules/'];

// Define the Jest configuration options.
const config = async (): Promise<Config> => ({
  preset: 'ts-jest', // Use the 'ts-jest' preset for TypeScript.
  testEnvironment: 'node', // Use Node.js as the test environment.
  bail: 0, // Do not bail on the first test failure (0 means no bail).
  verbose: false, // Disable verbose output.
  silent: false,
  roots: ['./src'], // Specify the root directory for tests.
  transform: {
    '^.+\\.ts$': 'ts-jest', // Transform TypeScript and TypeScript files using 'ts-jest'.
  },
  // rootDir: 'src',
  transformIgnorePatterns: ['<rootDir>/node_modules/'], // Ignore transformations for specific directories.
  testPathIgnorePatterns: ignoreDirs, // Ignore specific directories when searching for test files.
  collectCoverageFrom: ['**/*.(t|j)s'],
  coveragePathIgnorePatterns: ignoreDirs, // Exclude specific directories from code coverage analysis.
  coverageDirectory: '<rootDir>/coverage/', // Specify the directory for code coverage reports.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.([t]sx?)$', // Regular expression to match test files.
  moduleFileExtensions: ['ts', 'js', 'json'], // List of file extensions for modules.
});
export default config;
