# Todolis

Todolisは、友達や家族と目標を共有し、進捗を管理できるWebアプリケーションです。

## 特徴

- **会員登録不要**: リンクを共有するだけで利用開始
- **リアルタイム更新**: 目標の進捗状況を即座に反映
- **コメント・リアクション**: メンバー間でのコミュニケーション促進
- **モバイル対応**: スマートフォンでも快適に利用

## 技術スタック

- **フロントエンド**: Vue.js 3 + TypeScript + Vuetify 3
- **ビルドツール**: Vite
- **状態管理**: Pinia
- **ルーティング**: Vue Router 4
- **スタイリング**: SCSS

## 開発環境のセットアップ

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

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── views/              # ページコンポーネント
│   ├── service-intro/  # サービス紹介ページ
│   ├── group-creation/ # グループ作成ページ
│   ├── link-display/   # リンク表示ページ
│   └── goal-display/   # 目標表示ページ
├── stores/             # Piniaストア
├── types/              # TypeScript型定義
├── styles/             # グローバルスタイル
└── router/             # ルーティング設定
```

## ライセンス

© 2025 Todolis