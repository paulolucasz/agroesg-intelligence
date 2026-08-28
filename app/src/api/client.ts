function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('API base URL is not configured.')
  }

  return baseUrl.replace(/\/+$/, '')
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('API request failed.')
  }

  return response.json() as Promise<T>
}
