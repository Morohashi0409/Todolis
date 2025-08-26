import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSpaceStore } from '@/stores/space'
import { createSpace } from '@/api/spaces'
import type { CreateSpaceRequest } from '@/api/types'

export const useGroupCreation = () => {
  const router = useRouter()
  const spaceStore = useSpaceStore()
  const loading = ref(false)
  const showError = ref(false)
  const errorMessage = ref('')
  const memberList = ref<string[]>([])
  const currentMemberInput = ref('')

  const formData = reactive<CreateSpaceRequest>({
    title: '',
    members: []
  })

  const addMember = () => {
    if (currentMemberInput.value.trim()) {
      memberList.value.push(currentMemberInput.value.trim())
      currentMemberInput.value = ''
      // formData.membersも更新
      formData.members = [...memberList.value]
    }
  }

  const removeMember = (index: number) => {
    memberList.value.splice(index, 1)
    // formData.membersも更新
    formData.members = [...memberList.value]
  }

  const handleSubmit = async () => {
    // デバッグ用：フォームデータの状態をログ出力
    console.log('Form submission - formData:', formData)
    console.log('Form submission - memberList:', memberList.value)
    console.log('Form submission - formData.title:', formData.title)
    console.log('Form submission - formData.title.trim():', formData.title.trim())
    console.log('Form submission - formData.title.length:', formData.title.length)

    if (!formData.title.trim()) {
      errorMessage.value = 'グループ名を入力してください。'
      showError.value = true
      return
    }

    if (memberList.value.length === 0) {
      errorMessage.value = 'メンバーを1人以上追加してください。'
      showError.value = true
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      // メンバー名を配列に変換
      const members = memberList.value

      // 実際のAPI呼び出し
      const response = await createSpace({
        title: formData.title,
        members: members
      })

      // ストアにトークンを保存
      spaceStore.setTokens({
        viewer: response.view_token,
        editor: response.edit_token
      })

      // リンク表示ページに遷移
      router.push('/links')

    } catch (error) {
      console.error('グループ作成エラー:', error)
      
      // エラーメッセージの詳細化
      if (error instanceof Error) {
        if (error.message.includes('422')) {
          errorMessage.value = '入力データの形式が正しくありません。グループ名は1-100文字、メンバー名は必須で50文字以内です。'
        } else if (error.message.includes('400')) {
          errorMessage.value = '入力データが正しくありません。グループ名は1-100文字、メンバー名は必須です。'
        } else if (error.message.includes('500')) {
          errorMessage.value = 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。'
        } else if (error.message.includes('timeout')) {
          errorMessage.value = 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。'
        } else if (error.message.includes('データ検証エラー')) {
          errorMessage.value = error.message
        } else {
          errorMessage.value = 'グループの作成に失敗しました。もう一度お試しください。'
        }
      } else {
        errorMessage.value = '予期しないエラーが発生しました。もう一度お試しください。'
      }
      
      showError.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    showError,
    errorMessage,
    formData,
    memberList,
    currentMemberInput,
    addMember,
    removeMember,
    handleSubmit
  }
}

export { default } from './group-creation.vue'
