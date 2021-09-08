module.exports = {
    displayName: 'unit-tests',
    rootDir: '../../src',
    preset: '../jest.preset.js',
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1',
        '^test/(.*)$': '<rootDir>/../test/$1',
        '^@decorators$': '<rootDir>/decorators',
        '^@exceptions$': '<rootDir>/exceptions',
        '^@interceptors$': '<rootDir>/interceptors',
        '^@modules/(.*)$': '<rootDir>/modules/$1',
        '^@guards$': '<rootDir>/guards',
    },

    testRegex: '.spec.ts$',
};
