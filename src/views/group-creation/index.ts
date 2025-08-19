import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSpaceStore } from '@/stores/space'
import type { CreateSpaceRequest } from '@/types'

export const useGroupCreation = () => {
  const router = useRouter()
  const spaceStore = useSpaceStore()
  const loading = ref(false)
  const showError = ref(false)
  const errorMessage = ref('')
  const memberList = ref<string[]>([])
  const currentMemberInput = ref('')

  const formData = reactive<CreateSpaceRequest>({
    name: '',
    members: '',
    description: ''
  })

  const addMember = () => {
    if (currentMemberInput.value.trim()) {
      memberList.value.push(currentMemberInput.value.trim())
      currentMemberInput.value = ''
      // formData.membersも更新
      formData.members = memberList.value.join(', ')
    }
  }

  const removeMember = (index: number) => {
    memberList.value.splice(index, 1)
    // formData.membersも更新
    formData.members = memberList.value.join(', ')
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
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
      // メンバー名を配列に変換（実際の実装ではAPIに送信）
      const members = memberList.value

      // 実際のAPI呼び出しは後で実装
      // ここではモックデータを使用
      const mockResponse = {
        spaceId: 'mock-space-id-' + Date.now(),
        viewerToken: 'mock-viewer-token',
        editorToken: 'mock-editor-token'
      }

      // ストアにトークンを保存
      spaceStore.setTokens({
        viewer: mockResponse.viewerToken,
        editor: mockResponse.editorToken
      })

      // リンク表示ページに遷移
      router.push('/links')

    } catch (error) {
      console.error('引越しグループ作成エラー:', error)
      errorMessage.value = '引越しグループの作成に失敗しました。もう一度お試しください。'
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
