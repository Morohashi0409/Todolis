// API接続のメインファイル

// client.tsから明示的にエクスポート（ApiErrorの重複を避けるため）
export { 
  API_CONFIG, 
  HttpClient, 
  apiClient, 
  ApiError as ClientApiError, 
  validateResponse, 
  validateToken, 
  buildQueryParams,
  type HttpMethod,
  type HttpClientConfig
} from './client'

// types.tsから明示的にエクスポート
export { 
  type ApiResponse,
  type Space,
  type SpaceMember,
  type CreateSpaceRequest,
  type CreateSpaceResponse,
  type UpdateSpaceRequest,
  type SpaceInfoResponse,
  type Goal,
  type CreateGoalRequest,
  type UpdateGoalRequest,
  type GoalListResponse,
  type Comment,
  type CreateCommentRequest,
  type CommentListResponse,
  type Reaction,
  type CreateReactionRequest,
  type ReactionListResponse,
  type ApiError,
  type TokenValidation
} from './types'

// その他のモジュールは全体エクスポート
export * from './spaces'
export * from './goals'
export * from './comments'
export * from './reactions'
