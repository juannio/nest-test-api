export default {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testMatch: ['**/tests/**/*.spec.ts'], // <-- tu carpeta de tests
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
};
