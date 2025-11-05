import { logger } from './debugLogger'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  timeout?: number // milliseconds
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, timeout = 10000 } = options

  logger.info('API', `${method} ${endpoint}`, { body })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok) {
      logger.error('API', `${method} ${endpoint} failed`, {
        status: response.status,
        data,
      })
      throw new ApiError(response.status, data.error || 'Request failed', data)
    }

    logger.success('API', `${method} ${endpoint} success`, data)
    return data
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      logger.error('API', `${method} ${endpoint} timeout`, {
        timeout,
      })
      throw new Error('Request timeout - please check your connection')
    }

    if (error instanceof ApiError) {
      throw error
    }

    logger.error('API', `${method} ${endpoint} error`, error)
    throw new Error(error.message || 'Network error')
  }
}

// Helper function to wait
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}