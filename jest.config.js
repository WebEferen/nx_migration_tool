module.exports = {
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
    },
    rootDir: 'src',
    testEnvironment: 'node',
    testRegex: '.spec.ts$',
    transform: { '^.+\\.(t|j)s$': 'ts-jest' },
};
