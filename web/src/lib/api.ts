import createClient from 'openapi-fetch'
import type { paths } from './api-schema'

export const client = createClient<paths>({ baseUrl: '' })

export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.data === undefined) {
    throw new Error(`Request failed (${result.response.status})`)
  }
  return result.data
}
