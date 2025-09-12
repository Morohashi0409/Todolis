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
  goalId: string
): Promise<ReactionListResponse> {
  try {
    const raw = await apiClient.get<any>(`/api/goals/${goalId}/reactions/get/`)
    const parsed = validateResponse<any>(raw)
    // APIが配列（[ ... ]）または { reactions: [...] } のどちらでも受け入れる
    const reactions: Reaction[] = Array.isArray(parsed)
      ? parsed
      : (parsed?.reactions ?? [])
    return { reactions }
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
  data: CreateReactionRequest
): Promise<{ reaction: Reaction; message: string }> {
  try {
    // 1. 現行想定（typoを含む）
    try {
      const response = await apiClient.post<{ reaction: Reaction; message: string }>(
        `/api/goals/${goalId}/reactions/add/`,
        data
      )
      return validateResponse(response)
    } catch (err: any) {
      // 2. 404なら別名エンドポイントにフォールバック
      const status = err?.response?.status
      if (status !== 404) throw err
      const fallback = await apiClient.post<{ reaction: Reaction; message: string }>(
        `/api/goals/${goalId}/reactions/add/`,
        data
      )
      return validateResponse(fallback)
    }
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
  emoji: string
): Promise<{ reaction: Reaction; message: string }> {
  return createReaction(goalId, { emoji })
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
  if (!validateEmoji(data.emoji)) {
    return false
  }
  return true
}

/**
 * リアクションの投稿者名の文字数制限チェック
 */
// authorはAPIから削除されるため未使用

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
