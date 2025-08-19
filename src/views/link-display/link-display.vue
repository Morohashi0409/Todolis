<template>
  <div class="link-display">
    <!-- ヘッダー -->
    <v-app-bar color="primary" dark elevation="0" class="header">
      <v-container class="header-container">
        <v-row align="center">
          <v-col cols="12" class="text-center">
            <h1 class="app-title">Todolis</h1>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main class="main-content">
      <v-container class="content-container">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <!-- 完了メッセージ -->
            <div class="completion-message">
              <div class="success-icon">
                <v-icon size="80" color="success">mdi-check-circle</v-icon>
              </div>
              <h2 class="completion-title">作成が完了しました！</h2>
              <p class="completion-subtitle">
                グループページのURLをメンバーにシェアしましょう
              </p>
            </div>

            <!-- リンクカード -->
            <div class="link-cards">
              <!-- 編集用リンク -->
              <v-card class="link-card" elevation="2">
                <v-card-title class="link-title">
                  <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
                  編集用リンク
                </v-card-title>
                <v-card-text>
                  <div class="url-display">
                    <v-text-field
                      :value="editorUrl"
                      readonly
                      variant="outlined"
                      class="url-input"
                    />
                    <v-btn
                      color="primary"
                      variant="flat"
                      @click="copyToClipboard(editorUrl, 'editor')"
                      :loading="copying.editor"
                      class="copy-button"
                    >
                      {{ copying.editor ? 'コピー中...' : 'コピー' }}
                    </v-btn>
                  </div>
                  <div class="share-buttons">
                    <v-btn
                      color="success"
                      variant="outlined"
                      @click="shareToLine(editorUrl)"
                      class="share-button"
                    >
                      <v-icon class="mr-2">mdi-line</v-icon>
                      LINEで送る
                    </v-btn>
                    <v-btn
                      color="info"
                      variant="outlined"
                      @click="shareToOther(editorUrl)"
                      class="share-button"
                    >
                      <v-icon class="mr-2">mdi-share-variant</v-icon>
                      その他で共有
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- 閲覧用リンク -->
              <v-card class="link-card" elevation="2">
                <v-card-title class="link-title">
                  <v-icon color="info" class="mr-2">mdi-eye</v-icon>
                  閲覧用リンク
                </v-card-title>
                <v-card-text>
                  <div class="url-display">
                    <v-text-field
                      :value="viewerUrl"
                      readonly
                      variant="outlined"
                      class="url-input"
                    />
                    <v-btn
                      color="primary"
                      variant="flat"
                      @click="copyToClipboard(viewerUrl, 'viewer')"
                      :loading="copying.viewer"
                      class="copy-button"
                    >
                      {{ copying.viewer ? 'コピー中...' : 'コピー' }}
                    </v-btn>
                  </div>
                  <div class="share-buttons">
                    <v-btn
                      color="success"
                      variant="outlined"
                      @click="shareToLine(viewerUrl)"
                      class="share-button"
                    >
                      <v-icon class="mr-2">mdi-line</v-icon>
                      LINEで送る
                    </v-btn>
                    <v-btn
                      color="info"
                      variant="outlined"
                      @click="shareToOther(viewerUrl)"
                      class="share-button"
                    >
                      <v-icon class="mr-2">mdi-share-variant</v-icon>
                      その他で共有
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- セキュリティ設定 -->
            <div class="security-section">
              <v-btn
                color="warning"
                variant="outlined"
                @click="showPinDialog = true"
                class="pin-button"
              >
                <v-icon class="mr-2">mdi-lock</v-icon>
                PINコードを設定してセキュリティを高める（任意）
              </v-btn>
            </div>

            <!-- 次のステップ -->
            <div class="next-steps">
              <v-btn
                color="primary"
                size="large"
                @click="goToSpace"
                class="next-button"
              >
                グループページを開く
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- PIN設定ダイアログ -->
    <v-dialog v-model="showPinDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          PINコード設定
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            セキュリティを高めるために、4桁のPINコードを設定できます。
          </p>
          <v-text-field
            v-model="pinCode"
            label="PINコード（4桁）"
            type="password"
            maxlength="4"
            variant="outlined"
            :rules="[rules.pin]"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showPinDialog = false">キャンセル</v-btn>
          <v-btn color="primary" @click="setPinCode">設定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- フッター -->
    <v-footer class="footer" color="dark">
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <div class="footer-links">
              <a href="#" class="footer-link">よくある質問</a>
              <a href="#" class="footer-link">お問い合わせ</a>
              <a href="#" class="footer-link">広告掲載について</a>
              <a href="#" class="footer-link">アンケート</a>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="footer-links">
              <a href="#" class="footer-link">プライバシーポリシー</a>
              <a href="#" class="footer-link">利用規約</a>
              <a href="#" class="footer-link">運営元情報</a>
              <a href="#" class="footer-link">関連サイト</a>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-center">
            <p class="copyright">© 2025 Todolis</p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSpaceStore } from '@/stores/space'

const router = useRouter()
const route = useRoute()
const spaceStore = useSpaceStore()

const showPinDialog = ref(false)
const pinCode = ref('')

const copying = reactive({
  editor: false,
  viewer: false
})

const rules = {
  pin: (value: string) => {
    if (!value) return true
    return /^\d{4}$/.test(value) || '4桁の数字を入力してください'
  }
}

// スペースIDとトークンからURLを生成
const editorUrl = computed(() => {
  const spaceId = route.query.spaceId || 'mock-space-id'
  const token = spaceStore.editorToken || 'mock-editor-token'
  return `${window.location.origin}/space/${spaceId}?t=${token}`
})

const viewerUrl = computed(() => {
  const spaceId = route.query.spaceId || 'mock-space-id'
  const token = spaceStore.viewerToken || 'mock-viewer-token'
  return `${window.location.origin}/space/${spaceId}?t=${token}`
})

const copyToClipboard = async (text: string, type: 'editor' | 'viewer') => {
  try {
    copying[type] = true
    await navigator.clipboard.writeText(text)
    // 成功通知（実際の実装ではトースト表示）
    console.log('コピーしました')
  } catch (error) {
    console.error('コピーに失敗しました:', error)
  } finally {
    copying[type] = false
  }
}

const shareToLine = (url: string) => {
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(url)}`
  window.open(lineUrl, '_blank')
}

const shareToOther = (url: string) => {
  if (navigator.share) {
    navigator.share({
      title: 'Todolis - グループページ',
      text: 'グループページのリンクです',
      url: url
    })
  } else {
    // フォールバック: クリップボードにコピー
    copyToClipboard(url, 'editor')
  }
}

const setPinCode = () => {
  if (pinCode.value && /^\d{4}$/.test(pinCode.value)) {
    // PINコードを設定（実際の実装ではAPIに送信）
    console.log('PINコードを設定しました:', pinCode.value)
    showPinDialog.value = false
    pinCode.value = ''
  }
}

const goToSpace = () => {
  const spaceId = route.query.spaceId || 'mock-space-id'
  router.push(`/space/${spaceId}`)
}
</script>

<style src="./link-display.scss" lang="scss" scoped></style>
