# Taskel UI設計書 - イントロダクション

## 概要
このファイルはTodolisアプリのUI設計における基本方針と技術スタックを定義します。Todolisは、目標共有スペース（グループ）を作成・管理し、メンバー間で目標やToDoの進捗を共有・応援できるWebアプリケーションです。

## プロジェクト概要

### Todolisアプリのコンセプト
- **目的**: 登録不要で、すぐに始められる目標共有サービス
- **核となる機能**: グループ作成、目標管理、進捗共有、コミュニケーション
- **ターゲット**: 文化祭の準備、友達との旅行、家族のお手伝いなど、様々なシーンでの目標共有
- **特徴**: リンクで共有、進捗がわかる、応援できる

### サービス価値
- **即座性**: アカウント作成不要でリンク共有のみで利用開始
- **透明性**: グループ内の目標と進捗を可視化
- **協働性**: メンバー間での応援とコミュニケーション促進
- **シンプル性**: 直感的で使いやすいインターフェース

## 技術スタック

### フロントエンド
- **Vue.js 3**: 最新のVue.jsフレームワーク
- **TypeScript**: 型安全性を提供するJavaScriptのスーパーセット
- **SCSS**: CSSプリプロセッサによる効率的なスタイル管理
- **Beat**: モダンなUIフレームワーク

### 開発ツール
- **Vite**: 高速なビルドツールと開発サーバー
- **ESLint**: TypeScriptコードの品質チェック
- **Prettier**: コードフォーマット
- **StyleLint**: SCSS品質チェック

### 状態管理・ルーティング
- **Pinia**: Vue3対応の状態管理ライブラリ
- **Vue Router 4**: Vue3対応のルーティング

## アーキテクチャ指針

### ファイル分割の原則
このプロジェクトでは、各コンポーネントを以下の4つのファイルに分割する設計パターンを採用しています：

```
component-name/
├── component-name.vue          # テンプレート部分のみ
├── component-name.ts           # TypeScriptロジック
├── component-name.scss         # SCSSスタイル
└── index.ts                   # エクスポート用
```

### ファイル分割の利点
- **関心の分離**: テンプレート、ロジック、スタイルの明確な分離
- **型安全性**: TypeScriptによる堅牢なコード
- **メンテナンス性**: 各ファイルの独立した管理が可能
- **チーム開発**: 複数開発者が同時に作業する際の競合回避
- **再利用性**: ロジックとスタイルの独立した再利用

### 各ファイルの役割

#### component-name.vue
```vue
<template>
  <div class="component-name">
    <!-- テンプレート内容 -->
  </div>
</template>

<script setup lang="ts" src="./component-name.ts"></script>
<style src="./component-name.scss" lang="scss" scoped></style>
```

#### component-name.ts
```typescript
import { ref, computed, onMounted } from 'vue'
import type { ComponentProps } from './types'

// コンポーネントのロジック
export default defineComponent({
  name: 'ComponentName',
  props: {
    // props定義
  },
  setup(props: ComponentProps) {
    // Composition APIを使用したロジック
  }
})
```

#### component-name.scss
```scss
.component-name {
  // コンポーネント固有のスタイル
  &__element {
    // BEM記法によるスタイル定義
  }
}
```

#### index.ts
```typescript
export { default } from './component-name.vue'
```

## 開発環境

### セットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# リント
npm run lint
npm run lint:fix
```

### 環境別ビルド
```bash
# 開発環境
npm run build:dev

# ステージング環境
npm run build:staging

# 本番環境
npm run build:prod
```

## コーディング規約

### TypeScript
- **型定義**: 明示的な型注釈を推奨
- **インターフェース**: 複雑なオブジェクト構造の定義
- **ジェネリクス**: 再利用可能な型定義の活用
- **ユニオン型**: 複数の型を許容する場合の活用

### Vue3 Composition API
- **setup関数**: コンポーネントロジックの集約
- **リアクティブAPI**: ref, reactive, computedの適切な使用
- **ライフサイクル**: onMounted, onUnmounted等の適切な使用
- **カスタムフック**: ロジックの再利用化

### SCSS
- **BEM記法**: クラス命名の一貫性
- **変数**: カラー、サイズ、フォント等の統一管理
- **ミックスイン**: 再利用可能なスタイル定義
- **ネスト**: 適切な深さでのネスト構造

### 命名規則
- **コンポーネント名**: PascalCase（例：`GoalCard`, `GroupForm`）
- **ファイル名**: kebab-case（例：`goal-card.vue`, `group-form.ts`）
- **変数・メソッド**: camelCase（例：`goalData`, `handleSubmit`）
- **定数**: UPPER_SNAKE_CASE（例：`API_ENDPOINT`, `MAX_GOALS`）
- **CSSクラス**: BEM記法（例：`.goal-card__title--completed`）

## Beat UIフレームワーク

### デザインシステム
- **カラーパレット**: ブランドカラーを基調とした統一感
- **タイポグラフィ**: 読みやすさを重視したフォント設計
- **スペーシング**: 一貫性のある余白システム
- **コンポーネント**: 再利用可能なUI要素

### レスポンシブデザイン
- **モバイルファースト**: 小画面からの設計
- **ブレークポイント**: 適切な画面サイズでのレイアウト変更
- **タッチフレンドリー**: モバイルデバイスでの操作性向上

## プロジェクト固有の注意事項

### Todolisアプリの特性
- **リンク共有**: 編集用・閲覧用の適切な権限管理
- **リアルタイム更新**: 目標の進捗状況の即座な反映
- **アニメーション**: 完了時の祝福アニメーション等のUX向上
- **セキュリティ**: PIN設定によるアクセス制御

### パフォーマンス
- **遅延読み込み**: 必要に応じたコンポーネントの読み込み
- **仮想スクロール**: 大量の目標リストの効率的な表示
- **キャッシュ戦略**: APIレスポンスの適切なキャッシュ

### アクセシビリティ
- **キーボードナビゲーション**: キーボードのみでの操作対応
- **スクリーンリーダー**: 適切なARIA属性の設定
- **カラーコントラスト**: 視認性の向上

## 次のステップ

このイントロダクションを基に、以下の詳細設計書を参照してください：

1. **サービス紹介ページ設計書**: ランディングページの詳細
2. **グループ作成ページ設計書**: グループ作成フォームの詳細
3. **リンク表示ページ設計書**: 共有リンクの表示と管理
4. **目標入力ページ設計書**: 目標追加フォームの詳細
5. **目標表示ページ設計書**: 目標一覧と進捗管理の詳細

---

*このファイルは Taskel UI設計書の基本方針を定義し、開発チームが一貫性のある高品質なUIを構築するための指針となります。*
