import { jest } from '@jest/globals'

export const authenticate =
  jest.fn<typeof import('../src/codeclarity.js').authenticate>()
export const getUser = jest.fn<typeof import('../src/codeclarity.js').getUser>()
export const getOrganization =
  jest.fn<typeof import('../src/codeclarity.js').getOrganization>()
export const getProject =
  jest.fn<typeof import('../src/codeclarity.js').getProject>()
export const getAnalyzer =
  jest.fn<typeof import('../src/codeclarity.js').getAnalyzer>()
export const getGithuIntegration =
  jest.fn<typeof import('../src/codeclarity.js').getGithuIntegration>()
export const getResult =
  jest.fn<typeof import('../src/codeclarity.js').getResult>()
export const importProject =
  jest.fn<typeof import('../src/codeclarity.js').importProject>()
export const startAnalysis =
  jest.fn<typeof import('../src/codeclarity.js').startAnalysis>()
