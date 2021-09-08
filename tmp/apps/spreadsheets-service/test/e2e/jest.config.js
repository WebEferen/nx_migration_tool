module.exports = {
    displayName: 'e2e',
    preset: '../../jest.preset.js',
    rootDir: '.',
    testTimeout: 60000,
    testRegex: ['.(e2e-)?spec.ts$'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>../../../src/$1',
        '^test/(.*)$': '<rootDir>../$1',
        '^@decorators$': '<rootDir>../../../src/decorators',
        '^@exceptions$': '<rootDir>../../../src/exceptions',
        '^@interceptors$': '<rootDir>../../../src/interceptors',
        '^@modules/(.*)$': '<rootDir>../../../src/modules/$1',
        '^@guards$': '<rootDir>../../../src/guards',
    },
};
