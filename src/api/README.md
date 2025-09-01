# Taskel API 接続ライブラリ

このディレクトリには、TodolisアプリのAPI接続を専門としたファイル群が含まれています。

## ファイル構成

```
src/api/
├── index.ts          # メインエクスポートファイル
├── client.ts         # HTTPクライアントと基本設定
├── types.ts          # 型定義
├── spaces.ts         # スペース関連のAPI
├── goals.ts          # 目標関連のAPI
├── comments.ts       # コメント関連のAPI
├── reactions.ts      # リアクション関連のAPI
└── README.md         # このファイル
```

## 基本設定

APIの基本設定は `client.ts` で管理されています：

```typescript
import { API_CONFIG } from '@/api'

console.log(API_CONFIG.BASE_URL) // https://xenacious-bellina-todolis-api-fd112bad.koyeb.app
console.log(API_CONFIG.TIMEOUT)  // 10000ms
```

## 使用方法

### 1. スペース関連のAPI

```typescript
import { createSpace, getSpaceInfo, updateSpace } from '@/api'

// スペース作成
const newSpace = await createSpace({
  title: 'プロジェクトA',
  members: ['田中', '佐藤', '鈴木']
})

console.log('作成されたスペースID:', newSpace.space_id)
console.log('閲覧用トークン:', newSpace.view_token)
console.log('編集用トークン:', newSpace.edit_token)

// スペース情報取得
const spaceInfo = await getSpaceInfo(newSpace.space_id, newSpace.view_token)
console.log('スペース情報:', spaceInfo.space)
console.log('メンバー:', spaceInfo.members)

// スペース情報更新
const updatedSpace = await updateSpace(newSpace.space_id, newSpace.edit_token, {
  title: 'プロジェクトA（更新版）',
  members: ['田中', '佐藤', '鈴木', '高橋']
})
```

### 2. 目標関連のAPI

```typescript
import { createGoal, getGoalList, updateGoal, deleteGoal } from '@/api'

// 目標一覧取得
const goalList = await getGoalList(spaceId)
console.log('完了済み目標数:', goalList.done_count)
console.log('未完了目標数:', goalList.todo_count)
console.log('達成率:', goalList.achievement_rate)

// 目標作成
const newGoal = await createGoal(spaceId, editToken, {
  title: 'API設計書の作成',
  detail: 'RESTful APIの設計とドキュメント作成',
  assignee: '田中',
  due_on: '2024-12-31'
})

// 目標更新
const updatedGoal = await updateGoal(goalId, editToken, {
  status: 'done',
  detail: 'RESTful APIの設計とドキュメント作成（完了）'
})

// 目標削除
await deleteGoal(goalId, editToken)
```

### 3. コメント関連のAPI

```typescript
import { getCommentList, createComment, addComment } from '@/api'

// コメント一覧取得
const comments = await getCommentList(goalId, viewToken)
console.log('コメント数:', comments.comments.length)

// コメント作成
const newComment = await createComment(goalId, editToken, {
  author: '田中',
  body: '進捗は順調です。来週までに完了予定です。'
})

// 簡易版コメント作成
const simpleComment = await addComment(goalId, editToken, '田中', '進捗は順調です。')
```

### 4. リアクション関連のAPI

```typescript
import { getReactionList, createReaction, addReaction, COMMON_EMOJIS } from '@/api'

// リアクション一覧取得
const reactions = await getReactionList(goalId, viewToken)
console.log('リアクション数:', reactions.reactions.length)

// リアクション作成
const newReaction = await createReaction(goalId, editToken, {
  author: '田中',
  emoji: '👍'
})

// 簡易版リアクション作成
const simpleReaction = await addReaction(goalId, editToken, '田中', COMMON_EMOJIS.HEART)

// よく使われる絵文字
console.log('いいね:', COMMON_EMOJIS.LIKE)
console.log('ハート:', COMMON_EMOJIS.HEART)
console.log('拍手:', COMMON_EMOJIS.CLAP)
```

## エラーハンドリング

```typescript
import { ApiError } from '@/api'

try {
  const spaceInfo = await getSpaceInfo(spaceId, viewToken)
  // 成功時の処理
} catch (error) {
  if (error instanceof ApiError) {
    console.error('APIエラー:', error.message)
    console.error('ステータスコード:', error.status)
    console.error('エラーコード:', error.code)
  } else {
    console.error('予期しないエラー:', error)
  }
}
```

## バリデーション

```typescript
import { 
  validateCommentData, 
  checkCommentLength,
  validateReactionData,
  validateEmoji 
} from '@/api'

// コメントデータの検証
const commentData = { author: '田中', body: 'テストコメント' }
if (validateCommentData(commentData)) {
  // データが有効
  const lengthCheck = checkCommentLength(commentData.body)
  console.log('文字数:', lengthCheck.current, '/', lengthCheck.max)
}

// リアクションデータの検証
const reactionData = { author: '田中', emoji: '👍' }
if (validateReactionData(reactionData)) {
  // データが有効
  console.log('絵文字が有効です')
}
```

## トークン管理

```typescript
import { validateToken, validateSpaceToken } from '@/api'

// トークンの基本検証
const isValid = validateToken(token)

// スペーストークンの妥当性チェック
const isValidViewToken = await validateSpaceToken(spaceId, viewToken, 'view')
const isValidEditToken = await validateSpaceToken(spaceId, editToken, 'edit')
```

## 注意事項

1. **トークンの管理**: 閲覧用トークン（view_token）と編集用トークン（edit_token）を適切に管理してください
2. **エラーハンドリング**: 必ずtry-catch文でエラーハンドリングを行ってください
3. **バリデーション**: データ送信前にクライアントサイドでのバリデーションを行ってください
4. **レート制限**: APIの呼び出し頻度に注意してください

## サポートされているAPI

- ✅ スペース作成・取得・更新
- ✅ 目標作成・取得・更新・削除
- ✅ コメント作成・取得
- ✅ リアクション作成・取得
- ✅ スペース進捗サマリー取得
- ✅ トークン検証
- ✅ エラーハンドリング
- ✅ データバリデーション
