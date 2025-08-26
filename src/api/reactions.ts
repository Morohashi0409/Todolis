// リアクション関連のAPI接続機能

import { apiClient, buildQueryParams, validateResponse } from './client'
import type {
  CreateReactionRequest,
  ReactionListResponse,
  Reaction,
} from './types'

/**
 * リアクション一覧取得API
 * GET /api/goals/{goal_id}/reactions
 */
export async function getReactionList(
  goalId: string,
  viewToken: string
): Promise<ReactionListResponse> {
  try {
    if (!viewToken) {
      throw new Error('View token is required')
    }

    const queryParams = buildQueryParams({ view_token: viewToken })
    const response = await apiClient.get<ReactionListResponse>(`/api/goals/${goalId}/reactions${queryParams}`)
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to get reaction list:', error)
    throw error
  }
}

/**
 * リアクション作成API
 * POST /api/goals/{goal_id}/reactions
 */
export async function createReaction(
  goalId: string,
  editToken: string,
  data: CreateReactionRequest
): Promise<{ reaction: Reaction; message: string }> {
  try {
    if (!editToken) {
      throw new Error('Edit token is required')
    }

    const queryParams = buildQueryParams({ edit_token: editToken })
    const response = await apiClient.post<{ reaction: Reaction; message: string }>(
      `/api/goals/${goalId}/reactions${queryParams}`,
      data
    )
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to create reaction:', error)
    throw error
  }
}

/**
 * 絵文字と投稿者名でリアクション作成
 * POST /api/goals/{goal_id}/reactions の簡易版
 */
export async function addReaction(
  goalId: string,
  editToken: string,
  author: string,
  emoji: string
): Promise<{ reaction: Reaction; message: string }> {
  return createReaction(goalId, editToken, { author, emoji })
}

/**
 * よく使われる絵文字の定義
 */
export const COMMON_EMOJIS = {
  LIKE: '👍',
  HEART: '❤️',
  CLAP: '👏',
  CELEBRATE: '🎉',
  FIRE: '🔥',
  ROCKET: '🚀',
  CHECK: '✅',
  STAR: '⭐',
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  SMILE: '😊',
  LAUGH: '😂',
  COOL: '😎',
  THINKING: '🤔',
  PRAY: '🙏',
} as const

export type CommonEmoji = typeof COMMON_EMOJIS[keyof typeof COMMON_EMOJIS]

/**
 * 絵文字の検証
 */
export function validateEmoji(emoji: string): boolean {
  if (!emoji || emoji.trim().length === 0) {
    return false
  }
  if (emoji.length > 20) {
    return false
  }
  return true
}

/**
 * リアクションデータの検証
 */
export function validateReactionData(data: CreateReactionRequest): boolean {
  if (!data.author || data.author.trim().length === 0) {
    return false
  }
  if (data.author.length > 50) {
    return false
  }
  if (!validateEmoji(data.emoji)) {
    return false
  }
  return true
}

/**
 * リアクションの投稿者名の文字数制限チェック
 */
export function checkReactionAuthorLength(author: string): { isValid: boolean; current: number; max: number } {
  const maxLength = 50
  const currentLength = author.length
  return {
    isValid: currentLength <= maxLength,
    current: currentLength,
    max: maxLength,
  }
}

/**
 * 絵文字の文字数制限チェック
 */
export function checkEmojiLength(emoji: string): { isValid: boolean; current: number; max: number } {
  const maxLength = 20
  const currentLength = emoji.length
  return {
    isValid: currentLength <= maxLength,
    current: currentLength,
    max: maxLength,
  }
}

/**
 * リアクションの統計情報を取得
 */
export function getReactionStats(reactions: Reaction[]): Record<string, number> {
  const stats: Record<string, number> = {}
  
  reactions.forEach(reaction => {
    if (stats[reaction.emoji]) {
      stats[reaction.emoji]++
    } else {
      stats[reaction.emoji] = 1
    }
  })
  
  return stats
}

/**
 * 特定の絵文字のリアクション数を取得
 */
export function getReactionCount(reactions: Reaction[], emoji: string): number {
  return reactions.filter(reaction => reaction.emoji === emoji).length
}
