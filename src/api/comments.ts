// コメント関連のAPI接続機能

import { apiClient, buildQueryParams, validateResponse } from './client'
import type {
  CreateCommentRequest,
  CommentListResponse,
  Comment,
} from './types'

/**
 * コメント一覧取得API
 * GET /api/goals/{goal_id}/comments
 */
export async function getCommentList(
  goalId: string,
  viewToken: string
): Promise<CommentListResponse> {
  try {
    if (!viewToken) {
      throw new Error('View token is required')
    }

    const queryParams = buildQueryParams({ view_token: viewToken })
    const response = await apiClient.get<CommentListResponse>(`/api/goals/${goalId}/comments${queryParams}`)
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to get comment list:', error)
    throw error
  }
}

/**
 * コメント作成API
 * POST /api/goals/{goal_id}/comments
 */
export async function createComment(
  goalId: string,
  editToken: string,
  data: CreateCommentRequest
): Promise<{ comment: Comment; message: string }> {
  try {
    if (!editToken) {
      throw new Error('Edit token is required')
    }

    const queryParams = buildQueryParams({ edit_token: editToken })
    const response = await apiClient.post<{ comment: Comment; message: string }>(
      `/api/goals/${goalId}/comments${queryParams}`,
      data
    )
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to create comment:', error)
    throw error
  }
}

/**
 * コメントの投稿者名で作成
 * POST /api/goals/{goal_id}/comments の簡易版
 */
export async function addComment(
  goalId: string,
  editToken: string,
  author: string,
  body: string
): Promise<{ comment: Comment; message: string }> {
  return createComment(goalId, editToken, { author, body })
}

/**
 * コメントの検証
 */
export function validateCommentData(data: CreateCommentRequest): boolean {
  if (!data.author || data.author.trim().length === 0) {
    return false
  }
  if (data.author.length > 50) {
    return false
  }
  if (!data.body || data.body.trim().length === 0) {
    return false
  }
  if (data.body.length > 500) {
    return false
  }
  return true
}

/**
 * コメントの文字数制限チェック
 */
export function checkCommentLength(body: string): { isValid: boolean; current: number; max: number } {
  const maxLength = 500
  const currentLength = body.length
  return {
    isValid: currentLength <= maxLength,
    current: currentLength,
    max: maxLength,
  }
}

/**
 * コメントの投稿者名の文字数制限チェック
 */
export function checkAuthorLength(author: string): { isValid: boolean; current: number; max: number } {
  const maxLength = 50
  const currentLength = author.length
  return {
    isValid: currentLength <= maxLength,
    current: currentLength,
    max: maxLength,
  }
}
