// 注意: このファイルは既存のアプリケーション用の型定義です
// 新しいAPI接続機能については、src/api/types.ts を参照してください
// 
// API実装一覧に基づいた完全な型定義とAPI接続機能は以下で提供されています：
// - src/api/types.ts: 完全な型定義
// - src/api/client.ts: HTTPクライアント
// - src/api/spaces.ts: スペース関連API
// - src/api/goals.ts: 目標関連API
// - src/api/comments.ts: コメント関連API
// - src/api/reactions.ts: リアクション関連API

// API レスポンスの型定義
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// スペース作成リクエスト
export interface CreateSpaceRequest {
  name: string
  members: string
  description?: string
}

// スペース作成レスポンス
export interface CreateSpaceResponse {
  spaceId: string
  viewerToken: string
  editorToken: string
}

// 目標作成リクエスト
export interface CreateGoalRequest {
  title: string
  assignee?: string
  dueDate?: string
  description?: string
}

// 目標更新リクエスト
export interface UpdateGoalRequest {
  title?: string
  assignee?: string
  dueDate?: string
  description?: string
  isCompleted?: boolean
}

// 目標の型定義
export interface Goal {
  id: string
  title: string
  assignee?: string
  dueDate?: string
  description?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  comments: Comment[]
  reactions: Reaction[]
  // UI状態管理用のプロパティ
  showDetails?: boolean
  newComment?: string
}

// コメントの型定義
export interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
}

// リアクションの型定義
export interface Reaction {
  id: string
  type: 'like' | 'heart' | 'clap'
  author: string
  createdAt: string
}

// フィルタリング・ソート用
export interface GoalFilters {
  assignee?: string
  status?: 'all' | 'completed' | 'pending'
  sortBy?: 'createdAt' | 'dueDate' | 'title'
  sortOrder?: 'asc' | 'desc'
}

// ページネーション
export interface PaginationParams {
  page: number
  limit: number
}

// ユーザー設定
export interface UserSettings {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
}
