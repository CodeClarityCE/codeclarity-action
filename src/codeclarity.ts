/**
 * Waits for a number of milliseconds.
 *
 * @param email Email of the user that trigers the analysis.
 * @param password Password of the user that trigers the analysis.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function authenticate(
  email: string,
  password: string,
  domain: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Perform an HTTP POST request using fetch
    const requestBody = {
      email: email,
      password: password
    }

    interface responseBody {
      data: {
        token: string
      }
    }

    fetch(`https://${domain}/api/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Authentication failed with status ${response.status}`
          )
        }
        return response.json()
      })
      .then((data) => {
        const token = (data as responseBody).data?.token
        if (!token) {
          throw new Error('Authentication failed: no token received')
        }
        resolve(token)
      })
      .catch((error) => {
        console.error('Error during authentication:', error)
        reject(
          error instanceof Error ? error : new Error('Failed to authenticate')
        )
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function getUser(token: string, domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    interface responseBody {
      data: {
        id: string
      }
    }

    fetch(`https://${domain}/api/auth/user`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to get user with status ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        const userId = (data as responseBody).data?.id
        if (!userId) {
          throw new Error('Failed to get user: no user ID received')
        }
        resolve(userId)
      })
      .catch((error) => {
        console.error('Error getting user:', error)
        reject(error instanceof Error ? error : new Error('Failed to get user'))
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function getOrganization(
  token: string,
  domain: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    interface Organization {
      organization: {
        id: string
      }
    }

    interface responseBody {
      data: Array<Organization>
    }

    fetch(`https://${domain}/api/org`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to get organization with status ${response.status}`
          )
        }
        return response.json()
      })
      .then((data) => {
        const orgId = (data as responseBody).data?.[0]?.organization?.id
        if (!orgId) {
          throw new Error('Failed to get organization: no organization found')
        }
        resolve(orgId)
      })
      .catch((error) => {
        console.error('Error getting organization:', error)
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to get organization')
        )
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param organizationId Organization's ID.
 * @param projectName Project to analyze name.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function getProject(
  token: string,
  organizationId: string,
  projectName: string,
  domain: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    interface Project {
      id: string
    }

    interface responseBody {
      data: Array<Project>
    }

    fetch(
      `https://${domain}/api/org/${organizationId}/projects?search_key=${projectName}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to get project with status ${response.status}`
          )
        }
        return response.json()
      })
      .then((data) => {
        const projectId = (data as responseBody).data?.[0]?.id
        // Return empty string if project not found (will trigger import)
        resolve(projectId || '')
      })
      .catch((error) => {
        console.error('Error getting project:', error)
        reject(
          error instanceof Error ? error : new Error('Failed to get project')
        )
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param organizationId Organization's ID.
 * @param analyzerName Project to analyze name.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function getAnalyzer(
  token: string,
  organizationId: string,
  analyzerName: string,
  domain: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    interface responseBody {
      data: {
        id: string
      }
    }

    fetch(
      `https://${domain}/api/org/${organizationId}/analyzers/name?analyzer_name=${analyzerName}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to get analyzer with status ${response.status}`
          )
        }
        return response.json()
      })
      .then((data) => {
        const analyzerId = (data as responseBody).data?.id
        if (!analyzerId) {
          throw new Error(
            `Failed to get analyzer: analyzer '${analyzerName}' not found`
          )
        }
        resolve(analyzerId)
      })
      .catch((error) => {
        console.error('Error getting analyzer:', error)
        reject(
          error instanceof Error ? error : new Error('Failed to get analyzer')
        )
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param organizationId Organization's ID.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function getGithuIntegration(
  token: string,
  organizationId: string,
  domain: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    interface Integration {
      id: string
      integration_type: string
      integration_provider: string
    }

    interface responseBody {
      data: Array<Integration>
    }

    fetch(`https://${domain}/api/org/${organizationId}/integrations/vcs`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to get integrations with status ${response.status}`
          )
        }
        return response.json()
      })
      .then((data) => {
        const integrations = (data as responseBody).data
        if (!integrations || !Array.isArray(integrations)) {
          throw new Error('Failed to get integrations: invalid response')
        }
        for (const integration of integrations) {
          if (integration.integration_provider === 'GITHUB') {
            resolve(integration.id)
            return
          }
        }
        throw new Error(
          'Failed to get integration: no GitHub integration found'
        )
      })
      .catch((error) => {
        console.error('Error getting GitHub integration:', error)
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to get GitHub integration')
        )
      })
  })
}

export interface vulnerabilityReponseBody {
  data: {
    number_of_critical: number
    number_of_high: number
    number_of_medium: number
    number_of_low: number
    number_of_none: number
  }
  status_code: number
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param organizationId Organization's ID.
 * @param projectId Project's ID.
 * @param analysisId Analysis' ID.
 * @param domain Domain where CodeClarity's instance is located.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function getResult(
  token: string,
  organizationId: string,
  projectId: string,
  analysisId: string,
  domain: string
): Promise<vulnerabilityReponseBody> {
  return new Promise((resolve, reject) => {
    if (!analysisId) {
      reject(new Error('Failed to get results: analysisId is required'))
      return
    }

    fetch(
      `https://${domain}/api/org/${organizationId}/projects/${projectId}/analysis/${analysisId}/vulnerabilities/stats?workspace=.`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then((response) => {
        if (!response.ok) {
          // Return status code for retry logic in main.ts
          resolve({
            data: {} as vulnerabilityReponseBody['data'],
            status_code: response.status
          })
          return null
        }
        return response.json()
      })
      .then((data) => {
        if (data === null) return
        const result = data as vulnerabilityReponseBody
        if (!result.data) {
          throw new Error('Failed to get results: invalid response format')
        }
        resolve(result)
      })
      .catch((error) => {
        console.error('Error getting results:', error)
        reject(
          error instanceof Error ? error : new Error('Failed to get results')
        )
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param domain Domain where CodeClarity's instance is located.
 * @param organizationID Organization ID.
 * @param integrationID Integration ID.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function importProject(
  token: string,
  serverUrl: string,
  domain: string,
  organizationID: string,
  integrationID: string,
  projectName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Perform an HTTP POST request using fetch
    const requestBody = {
      integration_id: integrationID,
      url: `${serverUrl}/${projectName}`,
      name: projectName,
      description: 'Imported by Github Action'
    }

    interface responseBody {
      id: string
      status_message: string
    }

    fetch(`https://${domain}/api/org/${organizationID}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to import project with status ${response.status}`
          )
        }
        return response.json()
      })
      .then((data) => {
        const projectId = (data as responseBody).id
        if (!projectId) {
          throw new Error('Failed to import project: no project ID returned')
        }
        resolve(projectId)
      })
      .catch((error) => {
        console.error('Error importing project:', error)
        reject(
          error instanceof Error ? error : new Error('Failed to import project')
        )
      })
  })
}

/**
 * Waits for a number of milliseconds.
 *
 * @param token User's token.
 * @param domain Domain where CodeClarity's instance is located.
 * @param organizationID Organization ID.
 * @param projectID Project ID.
 * @param analyzerID Analyzer ID.
 * @param branchName Branch to analyze.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function startAnalysis(
  token: string,
  domain: string,
  organizationID: string,
  projectID: string,
  analyzerID: string,
  branchName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Perform an HTTP POST request using fetch
    const requestBody = {
      analyzer_id: analyzerID,
      branch: branchName,
      config: {
        'js-sbom': {
          branch: branchName
        },
        'license-finder': {
          licensePolicy: []
        }
      }
    }

    interface responseBody {
      id: string
    }

    interface errorResponseBody {
      message?: string
      error?: string
    }

    fetch(
      `https://${domain}/api/org/${organizationID}/projects/${projectID}/analyses`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorData = (await response
            .json()
            .catch(() => ({}))) as errorResponseBody
          const errorMessage =
            errorData.message || errorData.error || `HTTP ${response.status}`
          throw new Error(`Failed to start analysis: ${errorMessage}`)
        }
        return response.json()
      })
      .then((data) => {
        const analysisId = (data as responseBody).id
        if (!analysisId) {
          throw new Error('Failed to start analysis: no analysis ID returned')
        }
        resolve(analysisId)
      })
      .catch((error) => {
        console.error('Error starting analysis:', error)
        reject(
          error instanceof Error ? error : new Error('Failed to start analysis')
        )
      })
  })
}
