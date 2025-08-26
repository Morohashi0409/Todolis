// API実装一覧に基づいた型定義

// 基本的なAPIレスポンス型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// スペース関連の型定義
export interface Space {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface SpaceMember {
  name: string
  last_active_at?: string
}

export interface CreateSpaceRequest {
  title: string
  members: string[]
}

export interface CreateSpaceResponse {
  space_id: string
  view_token: string
  edit_token: string
  message: string
}

export interface UpdateSpaceRequest {
  title?: string
  members?: string[]
}

export interface SpaceInfoResponse {
  space: Space
  members: SpaceMember[]
}

// 目標関連の型定義
export interface Goal {
  id: string
  space_id: string
  title: string
  detail?: string
  assignee?: string
  due_on?: string
  status: 'todo' | 'done'
  order_index: number
  created_at: string
  updated_at: string
}

export interface CreateGoalRequest {
  title: string
  detail?: string
  assignee?: string
  due_on?: string
}

export interface UpdateGoalRequest {
  title?: string
  detail?: string
  assignee?: string
  due_on?: string
  status?: 'todo' | 'done'
}

export interface GoalListResponse {
  space_id: string
  total_count: number
  done_count: number
  todo_count: number
  achievement_rate: number
  done_tasks: Goal[]
  todo_tasks: Goal[]
}

// コメント関連の型定義
export interface Comment {
  id: string
  goal_id: string
  author: string
  body: string
  created_at: string
}

export interface CreateCommentRequest {
  author: string
  body: string
}

export interface CommentListResponse {
  comments: Comment[]
}

// リアクション関連の型定義
export interface Reaction {
  id: string
  goal_id: string
  author: string
  emoji: string
  created_at: string
}

export interface CreateReactionRequest {
  author: string
  emoji: string
}

export interface ReactionListResponse {
  reactions: Reaction[]
}

// スペース進捗サマリーの型定義
export interface SpaceSummaryResponse {
  summary: {
    total_goals: number
    completed_goals: number
    pending_goals: number
    completion_rate: number
    recent_activities?: any[]
  }
}

// エラーレスポンスの型定義
export interface ApiError {
  error: string
  message: string
  status_code: number
}

// 認証関連の型定義
export interface TokenValidation {
  space_id: string
  is_valid: boolean
  permissions: 'view' | 'edit'
}
