// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  buildCommand: 'tsc -b tsconfig.test.json',
  testRunner: 'command',
  coverageAnalysis: 'perTest'
}
export default config
