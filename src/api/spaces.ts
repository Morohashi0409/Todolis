// スペース関連のAPI接続機能

import { apiClient, buildQueryParams, validateResponse } from './client'
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  UpdateSpaceRequest,
  SpaceInfoResponse,
  SpaceSummaryResponse,
} from './types'

/**
 * スペース作成リクエストのデータ検証
 */
export function validateCreateSpaceRequest(data: CreateSpaceRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // タイトルの検証
  if (!data.title || data.title.trim().length === 0) {
    errors.push('タイトルは必須です')
  } else if (data.title.length > 100) {
    errors.push('タイトルは100文字以内で入力してください')
  }
  
  // メンバーの検証
  if (!Array.isArray(data.members)) {
    errors.push('メンバーは配列形式で指定してください')
  } else if (data.members.length === 0) {
    errors.push('メンバーは1人以上指定してください')
  } else {
    // 各メンバー名の検証
    data.members.forEach((member, index) => {
      if (!member || member.trim().length === 0) {
        errors.push(`メンバー${index + 1}の名前が空です`)
      } else if (member.length > 50) {
        errors.push(`メンバー${index + 1}の名前は50文字以内で入力してください`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * スペース作成API
 * POST /api/spaces
 * 既存のPython APIに合わせて、titleをクエリパラメータ、membersをJSONボディで送信
 */
export async function createSpace(data: CreateSpaceRequest): Promise<CreateSpaceResponse> {
  try {
    // データ検証
    const validation = validateCreateSpaceRequest(data)
    if (!validation.isValid) {
      throw new Error(`データ検証エラー: ${validation.errors.join(', ')}`)
    }
    
    // デバッグ用：送信データをログ出力
    console.log('Sending createSpace request:', {
      url: `/api/spaces?title=${encodeURIComponent(data.title)}`,
      data: data,
      dataType: typeof data,
      membersType: Array.isArray(data.members) ? 'array' : typeof data.members,
      membersLength: Array.isArray(data.members) ? data.members.length : 'not array'
    })
    
    // titleをクエリパラメータ、membersをJSONボディで送信
    const url = `${apiClient['config'].baseURL}/api/spaces?title=${encodeURIComponent(data.title)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(data.members)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const responseData = await response.json()
    return validateResponse(responseData)
  } catch (error) {
    console.error('Failed to create space:', error)
    throw error
  }
}

/**
 * スペース情報取得API
 * GET /api/spaces/{space_id}
 */
export async function getSpaceInfo(
  spaceId: string,
  viewToken: string
): Promise<SpaceInfoResponse> {
  try {
    if (!viewToken) {
      throw new Error('View token is required')
    }

    const queryParams = buildQueryParams({ view_token: viewToken })
    const response = await apiClient.get<SpaceInfoResponse>(`/api/spaces/${spaceId}${queryParams}`)
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to get space info:', error)
    throw error
  }
}

/**
 * スペース情報更新API
 * PUT /api/spaces/{space_id}
 */
export async function updateSpace(
  spaceId: string,
  editToken: string,
  data: UpdateSpaceRequest
): Promise<SpaceInfoResponse> {
  try {
    if (!editToken) {
      throw new Error('Edit token is required')
    }

    const queryParams = buildQueryParams({ edit_token: editToken })
    const response = await apiClient.put<SpaceInfoResponse>(`/api/spaces/${spaceId}${queryParams}`, data)
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to update space:', error)
    throw error
  }
}

/**
 * スペース進捗サマリー取得API
 * GET /api/spaces/{space_id}/summary
 */
export async function getSpaceSummary(
  spaceId: string,
  viewToken: string
): Promise<SpaceSummaryResponse> {
  try {
    if (!viewToken) {
      throw new Error('View token is required')
    }

    const queryParams = buildQueryParams({ view_token: viewToken })
    const response = await apiClient.get<SpaceSummaryResponse>(`/api/spaces/${spaceId}/summary${queryParams}`)
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to get space summary:', error)
    throw error
  }
}

/**
 * スペースの存在確認
 * GET /api/spaces/{space_id} (ヘッドリクエストで軽量チェック)
 */
export async function checkSpaceExists(spaceId: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiClient['config'].baseURL}/api/spaces/${spaceId}`, {
      method: 'HEAD',
    })
    return response.ok
  } catch (error) {
    console.error('Failed to check space existence:', error)
    return false
  }
}

/**
 * トークンの妥当性チェック
 */
export async function validateSpaceToken(
  spaceId: string,
  token: string,
  type: 'view' | 'edit'
): Promise<boolean> {
  try {
    if (!token) return false

    const queryParams = buildQueryParams({ 
      [type === 'view' ? 'view_token' : 'edit_token']: token 
    })
    
    const response = await apiClient.get(`/api/spaces/${spaceId}${queryParams}`)
    return !!response
  } catch (error) {
    console.error('Failed to validate space token:', error)
    return false
  }
}

/**
 * テスト用：APIエンドポイントの動作確認
 */
export async function testSpaceEndpoint(): Promise<any> {
  try {
    console.log('Testing space endpoint...')
    
    // テストデータ
    const testData = {
      title: 'テストグループ',
      members: ['テストユーザー1', 'テストユーザー2']
    }
    
    console.log('Test data:', testData)
    
    // titleをクエリパラメータ、membersをJSONボディで送信
    const url = `${apiClient['config'].baseURL}/api/spaces?title=${encodeURIComponent(testData.title)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(testData.members)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const responseData = await response.json()
    console.log('Test response:', responseData)
    return responseData
  } catch (error) {
    console.error('Test failed:', error)
    throw error
  }
}
