import * as core from '@actions/core'
import {
  authenticate,
  getAnalyzer,
  getGithuIntegration,
  getOrganization,
  getProject,
  getResult,
  getUser,
  importProject,
  startAnalysis
} from './codeclarity.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const branch: string = core.getInput('branch')
    const serverUrl: string = core.getInput('serverUrl')
    let projectName: string = core.getInput('projectName')
    let analyzerName: string = core.getInput('analyzerName')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(
      `Analyzing project ${projectName} on branch ${branch} with analyzer ${analyzerName} ...`
    )

    analyzerName = encodeURIComponent(analyzerName)
    core.debug(`Sanitized analyzer name is ${analyzerName}`)
    projectName = encodeURIComponent(projectName)
    core.debug(`Sanitized analyzer name is ${projectName}`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())

    // Retrieving information stored in env vars
    const email = process.env.EMAIL
    const password = process.env.PASSWORD
    if (!email || !password) {
      const error = new Error('email or password env var empty')
      core.setFailed(error.message)
      return
    }
    const domain = process.env.DOMAIN || 'platform.codeclarity.io' // Read from environment variable or default
    core.debug(domain)

    // Authenticate
    const userToken = await authenticate(email, password, domain)
    core.debug('User token: ' + userToken)

    // Retrieve User
    const userId = await getUser(userToken, domain)
    core.debug('User ID: ' + userId)

    // Retrieve organization
    const organizationId = await getOrganization(userToken, domain)
    core.debug('Organization ID: ' + organizationId)

    // Retrieve project
    let projectId = await getProject(
      userToken,
      organizationId,
      projectName,
      domain
    )
    core.debug('Project ID: ' + projectId)

    if (projectId == '') {
      // Retrieve integration
      const integrationId = await getGithuIntegration(
        userToken,
        organizationId,
        domain
      )
      core.debug('Integration ID: ' + integrationId)

      projectId = await importProject(
        userToken,
        serverUrl,
        domain,
        organizationId,
        integrationId,
        core.getInput('projectName')
      )
      core.debug('Integration ID: ' + projectId)
    }

    // Retrieve analyzer
    const analyzerId = await getAnalyzer(
      userToken,
      organizationId,
      analyzerName,
      domain
    )
    core.debug('Analyzer ID: ' + analyzerId)

    // Start analysis
    const analysisId = await startAnalysis(
      userToken,
      domain,
      organizationId,
      projectId,
      analyzerId,
      branch
    )
    core.debug('Analysis ID: ' + analysisId)

    // Fetch results

    // Wait 15 seconds
    await new Promise((resolve) => setTimeout(resolve, 15000))

    let result = await getResult(
      userToken,
      organizationId,
      projectId,
      analysisId,
      domain
    )

    if (result.status_code == 500) {
      core.debug('Initial attempt failed. Retrying...')
      // Wait 30 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 30000))
      result = await getResult(
        userToken,
        organizationId,
        projectId,
        analysisId,
        domain
      )
    }

    core.debug(new Date().toTimeString())

    switch (true) {
      case result.data.number_of_critical > 0:
        core.setFailed('There is a critical vulnerability')
        break
      case result.data.number_of_high > 0:
        core.setFailed('There is a high vulnerability')
        break
      default:
        // No vulnerabilities found, do nothing
        break
    }

    // Set outputs for other workflow steps to use
    core.setOutput('vulnerabilities', result)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
