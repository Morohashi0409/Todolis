// 目標関連のAPI接続機能

import { apiClient, buildQueryParams, validateResponse } from './client'
import type {
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalListResponse,
  Goal,
} from './types'

/**
 * 目標一覧取得API
 * GET /api/goals/list/{space_id}/get/
 */
export async function getGoalList(spaceId: string): Promise<GoalListResponse> {
  try {
    const response = await apiClient.get<GoalListResponse>(`/api/goals/list/${spaceId}/get/`)
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to get goal list:', error)
    throw error
  }
}

/**
 * 目標作成API
 * POST /api/goals/{space_id}/add/
 */
export async function createGoal(
  spaceId: string,
  data: CreateGoalRequest
): Promise<{ goal: Goal; space_id: string; task_id: string }> {
  try {
    // クエリパラメータとしてデータを送信
    const queryParams = buildQueryParams(data)
    const response = await apiClient.post<{ goal: Goal; space_id: string; task_id: string }>(
      `/api/goals/${spaceId}/add/${queryParams}`
    )
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to create goal:', error)
    throw error
  }
}

/**
 * 目標更新API
 * PUT /api/goals/{goal_id}/update/
 */
export async function updateGoal(
  goalId: string,
  editToken: string,
  data: UpdateGoalRequest
): Promise<{ goal: Goal; goal_id: string; message: string }> {
  try {
    if (!editToken) {
      throw new Error('Edit token is required')
    }

    const queryParams = buildQueryParams({ edit_token: editToken })
    const response = await apiClient.put<{ goal: Goal; goal_id: string; message: string }>(
      `/api/goals/${goalId}/update/${queryParams}`,
      data
    )
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to update goal:', error)
    throw error
  }
}

/**
 * 目標削除API
 * DELETE /api/goals/{goal_id}/delete/
 */
export async function deleteGoal(goalId: string, editToken: string): Promise<void> {
  try {
    if (!editToken) {
      throw new Error('Edit token is required')
    }

    const queryParams = buildQueryParams({ edit_token: editToken })
    await apiClient.delete(`/api/goals/${goalId}/delete/${queryParams}`)
  } catch (error) {
    console.error('Failed to delete goal:', error)
    throw error
  }
}

/**
 * 目標のステータス変更（FastAPI対応）
 * PUT /api/goals/{goal_id}/update
 */
export async function updateGoalStatus(
  goalId: string,
  status: 'todo' | 'done',
  currentGoal: Goal
): Promise<{ goal: Goal; message: string }> {
  try {
    const queryParams = buildQueryParams({
      status,
      title: currentGoal.title,
      detail: currentGoal.detail || '',
      assignee: currentGoal.assignee || '',
      due_on: currentGoal.due_on || ''
    })
    
    const response = await apiClient.put<{ goal: Goal; message: string }>(
      `/api/goals/${goalId}/update${queryParams}`
    )
    return validateResponse(response)
  } catch (error) {
    console.error('Failed to update goal status:', error)
    throw error
  }
}

/**
 * 目標の担当者変更
 * PUT /api/goals/{goal_id} の特殊ケース
 */
export async function updateGoalAssignee(
  goalId: string,
  editToken: string,
  assignee: string
): Promise<{ goal: Goal; goal_id: string; message: string }> {
  return updateGoal(goalId, editToken, { assignee })
}

/**
 * 目標の期限変更
 * PUT /api/goals/{goal_id} の特殊ケース
 */
export async function updateGoalDueDate(
  goalId: string,
  editToken: string,
  dueOn: string
): Promise<{ goal: Goal; goal_id: string; message: string }> {
  return updateGoal(goalId, editToken, { due_on: dueOn })
}

/**
 * 目標の詳細変更
 * PUT /api/goals/{goal_id} の特殊ケース
 */
export async function updateGoalDetail(
  goalId: string,
  editToken: string,
  detail: string
): Promise<{ goal: Goal; goal_id: string; message: string }> {
  return updateGoal(goalId, editToken, { detail })
}

/**
 * 目標のタイトル変更
 * PUT /api/goals/{goal_id} の特殊ケース
 */
export async function updateGoalTitle(
  goalId: string,
  editToken: string,
  title: string
): Promise<{ goal: Goal; goal_id: string; message: string }> {
  return updateGoal(goalId, editToken, { title })
}

/**
 * 目標の完了
 * PUT /api/goals/{goal_id} の特殊ケース
 */
export async function completeGoal(
  goalId: string,
  currentGoal: Goal
): Promise<{ goal: Goal; message: string }> {
  return updateGoalStatus(goalId, 'done', currentGoal)
}

/**
 * 目標の未完了に戻す
 * PUT /api/goals/{goal_id} の特殊ケース
 */
export async function uncompleteGoal(
  goalId: string,
  currentGoal: Goal
): Promise<{ goal: Goal; message: string }> {
  return updateGoalStatus(goalId, 'todo', currentGoal)
}
