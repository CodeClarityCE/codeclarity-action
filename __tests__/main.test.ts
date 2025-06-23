/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import {
  authenticate,
  getUser,
  getOrganization,
  getProject,
  getAnalyzer,
  getGithuIntegration,
  getResult,
  importProject,
  startAnalysis
} from '../__fixtures__/codeclarity.js'
import { vulnerabilityReponseBody } from '../src/codeclarity.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/codeclarity.js', () => ({
  authenticate,
  getUser,
  getOrganization,
  getProject,
  getAnalyzer,
  getGithuIntegration,
  getResult,
  importProject,
  startAnalysis
}))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation(() => '500')
    core.getInput.mockImplementation(() => '500')
    core.getInput.mockImplementation(() => '500')
    core.getInput.mockImplementation(() => '500')

    process.env.EMAIL = 'john.doe@codeclarity.io'
    process.env.PASSWORD = 'ThisIs4Str0ngP4ssW0rd?'
    // branch
    // serverUrl
    // projectName
    // analyzerName

    // Mock the wait function so that it does not actually wait.
    authenticate.mockImplementation(() => Promise.resolve('done!'))
    getUser.mockImplementation(() => Promise.resolve('user'))
    getOrganization.mockImplementation(() => Promise.resolve('user'))
    getProject.mockImplementation(() => Promise.resolve('user'))
    getAnalyzer.mockImplementation(() => Promise.resolve('user'))
    getGithuIntegration.mockImplementation(() => Promise.resolve('user'))
    importProject.mockImplementation(() => Promise.resolve('user'))
    startAnalysis.mockImplementation(() => Promise.resolve('user'))

    const test: vulnerabilityReponseBody = {
      data: {
        number_of_critical: 0,
        number_of_high: 0,
        number_of_medium: 0,
        number_of_low: 0,
        number_of_none: 0
      },
      status_code: 200
    }
    getResult.mockImplementation(() => Promise.resolve(test))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it(
    'Sets the vulnerabilities output',
    async () => {
      await run()

      // Verify the time output was set.
      expect(core.setOutput).toHaveBeenNthCalledWith(
        1,
        'vulnerabilities',
        // Simple regex to match a time string in the format HH:MM:SS.
        expect.objectContaining({ status_code: 200 })
      )
    },
    1000 * 60
  )

  it(
    'Sets a failed status',
    async () => {
      // Clear the getInput mock and return an invalid value.
      core.getInput.mockClear().mockReturnValueOnce('this is not a number')

      // Clear the wait mock and return a rejected promise.
      authenticate
        .mockClear()
        .mockRejectedValueOnce(new Error('milliseconds is not a number'))

      await run()

      // Verify that the action was marked as failed.
      expect(core.setFailed).toHaveBeenNthCalledWith(
        1,
        'milliseconds is not a number'
      )
    },
    1000 * 60
  )
})
