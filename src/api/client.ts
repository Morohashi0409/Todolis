// API接続の基本設定とHTTPクライアント

// APIの基本設定
export const API_CONFIG = {
  BASE_URL: 'https://xenacious-bellina-todolis-api-fd112bad.koyeb.app',
  TIMEOUT: 10000, // 10秒
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1秒
} as const

// HTTPメソッドの型定義
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// HTTPクライアントの設定
export interface HttpClientConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
}

// HTTPクライアントクラス
export class HttpClient {
  private config: HttpClientConfig

  constructor(config: HttpClientConfig) {
    this.config = config
  }

  // 基本的なHTTPリクエスト
  async request<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const fullUrl = `${this.config.baseURL}${url}`
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...headers,
    }

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // レスポンスが空の場合は空のオブジェクトを返す
      if (response.status === 204) {
        return {} as T
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error(`API request failed: ${method} ${fullUrl}`, error)
      throw error
    }
  }

  // GETリクエスト
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', url, undefined, headers)
  }

  // POSTリクエスト
  async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', url, data, headers)
  }

  // PUTリクエスト
  async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', url, data, headers)
  }

  // DELETEリクエスト
  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', url, undefined, headers)
  }

  // PATCHリクエスト
  async patch<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', url, data, headers)
  }
}

// デフォルトのHTTPクライアントインスタンス
export const apiClient = new HttpClient({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// エラーハンドリング用のユーティリティ
export class ApiError extends Error {
  public status: number
  public code: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code || 'UNKNOWN_ERROR'
  }
}

// レスポンスの検証用ユーティリティ
export function validateResponse<T>(response: any): T {
  if (response && typeof response === 'object') {
    return response as T
  }
  throw new ApiError('Invalid response format', 500, 'INVALID_RESPONSE')
}

// トークン検証用のユーティリティ
export function validateToken(token: string): boolean {
  return Boolean(token && token.length > 0)
}

// URLパラメータの構築用ユーティリティ
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
