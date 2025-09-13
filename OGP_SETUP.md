# OGP（Open Graph Protocol）設定について

## 概要
TaskelアプリのリンクをX（Twitter）、Slack、Facebook等で共有した際に、バナーのように表示されるためのOGPタグを設定しました。

## 設定内容

### 1. 基本的なOGPタグ
- `og:title`: ページのタイトル
- `og:description`: ページの説明
- `og:image`: 表示される画像
- `og:url`: ページのURL
- `og:type`: コンテンツの種類（website）
- `og:site_name`: サイト名
- `og:locale`: 言語設定（日本語）

### 2. Twitter Card設定
- `twitter:card`: カードの種類（summary_large_image）
- `twitter:title`: Twitter用のタイトル
- `twitter:description`: Twitter用の説明
- `twitter:image`: Twitter用の画像

### 3. 動的OGP更新
- 目標表示ページでは、スペース名と説明に基づいてOGPタグが動的に更新されます
- `useOGP` Composableを使用して、ページごとに適切なOGP情報を設定

## ファイル構成

```
src/
├── utils/
│   └── ogp.ts              # OGP関連のユーティリティ関数
├── composables/
│   └── useOGP.ts           # OGP機能のComposable
└── views/
    └── goal-display/
        └── goal-display.vue # 動的OGP更新の実装例
```

## 使用方法

### 基本的な使用
```typescript
import { useOGP } from '@/composables/useOGP'

const { updateOGP } = useOGP()

// OGPタグを更新
updateOGP({
  title: 'カスタムタイトル',
  description: 'カスタム説明',
  image: 'https://example.com/image.png',
  url: 'https://example.com/page'
})
```

### 動的更新の例
```typescript
// スペース情報に基づいてOGPタグを更新
watch([spaceName, spaceDescription], () => {
  updateOGP({
    title: `${spaceName.value} - Taskel`,
    description: `${spaceDescription.value} - Taskelで目標を共有し、進捗を管理しましょう。`,
    url: window.location.href
  })
}, { immediate: true })
```

## 検証方法

### 1. Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/

### 2. Twitter Card Validator
https://cards-dev.twitter.com/validator

### 3. LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/

### 4. Slack Link Preview
Slackでリンクを貼り付けて、プレビューが正しく表示されるか確認

## 注意事項

1. **画像サイズ**: 現在は`icon.png`（512x512px）を使用していますが、理想的には1200x630pxの画像を使用することを推奨します。

2. **URL**: 本番環境では、`https://taskel.app/`のURLを使用してください。

3. **キャッシュ**: SNSプラットフォームはOGPタグをキャッシュするため、変更後は上記の検証ツールでキャッシュをクリアしてください。

## 今後の改善点

1. **専用OGP画像の作成**: 1200x630pxの専用OGP画像を作成
2. **ページ別OGP設定**: 各ページに適したOGP情報の設定
3. **動的画像生成**: スペース情報に基づいた動的なOGP画像の生成
