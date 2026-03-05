const { createDefaultPreset } = require('ts-jest')

const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import("jest").Config} **/
module.exports = {
    testTimeout: 30000,
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
    collectCoverage: true,
    coverageProvider: 'v8',
    collectCoverageFrom: ['src/**/*.ts', '!tests/**', '!**/node_modules/**'],
}
