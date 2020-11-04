module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    setupFiles: ['<rootDir>/setupTests.ts'],
    testEnvironment: 'node',
    testTimeout: 60000,
    testRegex: ['.e2e-spec.ts$', '.spec.ts$'],
    transform: { '^.+\\.(t|j)s$': 'ts-jest' },
    moduleNameMapper: {
        '^src/(.*)$': '../src/$1',
    },
};
