/**
 * Unit tests for src/wait.ts
 */
import {
  authenticate,
  getAnalyzer,
  getUser,
  getOrganization,
  getProject
} from '../src/codeclarity.js'

describe('codeclarity.ts', () => {
  it('Tries to authenticate', async () => {
    const email = process.env.EMAIL || 'john.doe@codeclarity.io'
    const password = process.env.PASSWORD || 'ThisIs4Str0ngP4ssW0rd?'
    const domain = process.env.DOMAIN || 'localhost'
    const projectName = 'CodeClarityCE/frontend'
    const analyzerName = 'JavaScript Analyzer'

    const userToken = await authenticate(email, password, domain)

    expect(userToken).toBeDefined()

    // Retrieve User
    const userId = await getUser(userToken, domain)
    expect(userId).toBeDefined()

    // Retrieve organization
    const organizationId = await getOrganization(userToken, domain)
    expect(userId).toBeDefined()

    // Retrieve project
    const projectId = await getProject(
      userToken,
      organizationId,
      projectName,
      domain
    )
    expect(projectId).toBeDefined()

    const result = await getAnalyzer(
      userToken,
      organizationId,
      analyzerName,
      domain
    )

    expect(result).toBeDefined()
  })
})
