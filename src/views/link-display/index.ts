import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSpaceStore } from '@/stores/space'

export const useLinkDisplay = () => {
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
    const token = spaceStore.editorToken || 'mock-editor-token'
    return `${window.location.origin}/space/${token}`
  })

  const viewerUrl = computed(() => {
    const token = spaceStore.viewerToken || 'mock-viewer-token'
    return `${window.location.origin}/space/${token}`
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
    const spaceId = route.query.spaceId || spaceStore.currentSpace?.id || 'mock-space-id'
    router.push(`/space/${spaceId}`)
  }

  return {
    showPinDialog,
    pinCode,
    copying,
    rules,
    editorUrl,
    viewerUrl,
    copyToClipboard,
    shareToLine,
    shareToOther,
    setPinCode,
    goToSpace,
    // デバッグ情報用
    route,
    spaceStore
  }
}

export { default } from './link-display.vue'
