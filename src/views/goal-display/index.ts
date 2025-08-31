import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Goal, CreateGoalRequest } from '@/types'
import { getSpaceInfo } from '@/api/spaces'
import { getGoalList, createGoal } from '@/api/goals'

export const useGoalDisplay = () => {
  const route = useRoute()

  // 状態管理
  const isAddingGoal = ref(false)
  const sortOrder = ref('createdAt')
  const filters = reactive({
    assignee: '',
    status: 'all'
  })

  // ローディング・エラー状態
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 新しい目標のフォーム
  const newGoal = reactive<CreateGoalRequest>({
    title: '',
    assignee: '',
    dueDate: '',
    description: ''
  })

  // バリデーションルール
  const rules = {
    required: (value: string) => !!value || 'この項目は必須です'
  }

  // スペース情報
  const spaceName = ref('')
  const spaceDescription = ref('')
  const spaceId = ref('')
  const members = ref<string[]>([])

  // 目標データ
  const goals = ref<Goal[]>([])
  const totalGoals = ref(0)
  const completedGoals = ref(0)
  const progressPercentage = ref(0)

  // 計算プロパティ
  const assigneeOptions = computed(() => {
    // スペースメンバーのnicknameのみを使用
    const spaceMembers = members.value || []
    return spaceMembers.map(nickname => ({ title: nickname, value: nickname }))
  })

  const statusOptions = [
    { title: 'すべて', value: 'all' },
    { title: '完了済み', value: 'completed' },
    { title: '未完了', value: 'pending' }
  ]

  const filteredGoals = computed(() => {
    let filtered = goals.value

    // 担当者で絞り込み
    if (filters.assignee) {
      filtered = filtered.filter((g: Goal) => g.assignee === filters.assignee)
    }

    // 状態で絞り込み
    if (filters.status === 'completed') {
      filtered = filtered.filter((g: Goal) => g.isCompleted)
    } else if (filters.status === 'pending') {
      filtered = filtered.filter((g: Goal) => !g.isCompleted)
    }

    // ソート
    filtered.sort((a: Goal, b: Goal) => {
      switch (sortOrder.value) {
        case 'dueDate':
          if (!a.dueDate || !b.dueDate) return 0
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'title':
          const titleA = a.title || ''
          const titleB = b.title || ''
          return titleA.localeCompare(titleB)
        default:
          // 作成日時でのソート（新しい順）
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
      }
    })

    return filtered
  })

  // APIからスペース情報を取得
  const fetchSpaceInfo = async () => {
    try {
      loading.value = true
      error.value = null

      const spaceInfo = await getSpaceInfo(spaceId.value)
      
      spaceName.value = spaceInfo.space.title
      spaceDescription.value = `メンバー数: ${spaceInfo.members.length}人`
      
      // メンバー情報を保存（nicknameのみ）
      members.value = spaceInfo.members.map((member: any) => member.nickname || member.name || member)
      
    } catch (err) {
      console.error('スペース情報の取得に失敗:', err)
      error.value = 'スペース情報の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  // APIから目標一覧を取得
  const fetchGoals = async () => {
    try {
      loading.value = true
      error.value = null

      if (!spaceId.value) {
        throw new Error('スペースIDが不足しています')
      }

      const goalList = await getGoalList(spaceId.value)
      
      // データ形式を変換（安全に取得）
      totalGoals.value = goalList.total_count || 0
      completedGoals.value = goalList.done_count || 0
      progressPercentage.value = goalList.achievement_rate || 0

      // 完了済みと未完了の目標を統合
      const allGoals: Goal[] = []

      // 完了済み目標を変換
      if (goalList.done_tasks && Array.isArray(goalList.done_tasks)) {
        goalList.done_tasks.forEach((task: any) => {
          allGoals.push({
            id: task.id,
            title: task.title,
            description: task.detail || '',
            assignee: task.assignee || '',
            dueDate: task.due_on || '',
            isCompleted: true,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            comments: [],
            reactions: [],
            showDetails: false,
            newComment: ''
          })
        })
      }

      // 未完了目標を変換
      if (goalList.todo_tasks && Array.isArray(goalList.todo_tasks)) {
        goalList.todo_tasks.forEach((task: any) => {
          allGoals.push({
            id: task.id,
            title: task.title,
            description: task.detail || '',
            assignee: task.assignee || '',
            dueDate: task.due_on || '',
            isCompleted: false,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            comments: [],
            reactions: [],
            showDetails: false,
            newComment: ''
          })
        })
      }

      goals.value = allGoals
    } catch (err: any) {
      console.error('目標一覧の取得に失敗:', err)
      
      // 目標が0件の場合は正常な状態として扱う
      if (err.message && err.message.includes('No data found for space_id')) {
        totalGoals.value = 0
        completedGoals.value = 0
        progressPercentage.value = 0
        goals.value = []
        error.value = null
      } else {
        error.value = '目標一覧の取得に失敗しました'
      }
    } finally {
      loading.value = false
    }
  }

  // メソッド
  const toggleGoalStatus = async (goal: Goal) => {
    try {
      // ローカルで即座にステータスを更新（UI応答性向上）
      goal.isCompleted = !goal.isCompleted
      goal.updatedAt = new Date().toISOString()
      
      // 進捗データを即座に更新
      if (goal.isCompleted) {
        completedGoals.value++
      } else {
        completedGoals.value--
      }
      
      // 進捗率を再計算
      progressPercentage.value = totalGoals.value > 0 
        ? Math.round((completedGoals.value / totalGoals.value) * 100)
        : 0
      
      console.log(`${goal.title} のステータスを更新しました（ローカル）`)
      
      // バックグラウンドでAPI更新を試行（editTokenの実装が必要なため、現在は無効化）
      // TODO: editTokenの管理機能を実装後、以下のコードを有効化してサーバー同期を行う
      /*
      try {
        const updateData = {
          status: goal.isCompleted ? 'done' : 'todo'
        }
        await updateGoal(goal.id, editToken, updateData)
        console.log(`${goal.title} のステータスをサーバーに同期しました`)
      } catch (apiError) {
        console.error('目標ステータスの同期に失敗:', apiError)
        error.value = '目標ステータスの同期に失敗しました。データはローカルで保持されています。'
      }
      */
    } catch (err) {
      console.error('目標ステータスの更新に失敗:', err)
      error.value = '目標ステータスの更新に失敗しました'
    }
  }

  const showComments = (goal: Goal) => {
    goal.showDetails = !goal.showDetails
  }

  const addComment = (goal: Goal) => {
    if (!goal.newComment?.trim()) return

    const comment = {
      id: Date.now().toString(),
      content: goal.newComment.trim(),
      author: 'あなた',
      createdAt: new Date().toISOString()
    }

    goal.comments.push(comment)
    goal.newComment = ''
  }

  const toggleReaction = (goal: Goal, type: 'like' | 'heart' | 'clap') => {
    const existingReaction = goal.reactions.find((r: any) => r.author === 'あなた' && r.type === type)
    
    if (existingReaction) {
      goal.reactions = goal.reactions.filter((r: any) => r.id !== existingReaction.id)
    } else {
      const reaction = {
        id: Date.now().toString(),
        type,
        author: 'あなた',
        createdAt: new Date().toISOString()
      }
      goal.reactions.push(reaction)
    }
  }

  const hasReaction = (goal: Goal, type: 'like' | 'heart' | 'clap') => {
    return goal.reactions.some((r: any) => r.author === 'あなた' && r.type === type)
  }

  const addGoal = async () => {
    try {
      if (!newGoal.title.trim()) return

      error.value = null

      // APIに送信するデータ形式に変換
      const goalData = {
        title: newGoal.title.trim(),
        detail: newGoal.description?.trim() || '',
        assignee: newGoal.assignee?.trim() || '',
        due_on: newGoal.dueDate || ''
      }

      // 必須フィールドの検証
      if (!goalData.title) {
        error.value = 'タイトルは必須です'
        return
      }
      if (!goalData.assignee) {
        error.value = '担当者は必須です'
        return
      }
      if (!goalData.due_on) {
        error.value = '期限は必須です'
        return
      }

      // 一時的なIDを生成してローカルに即座に追加
      const tempId = `temp_${Date.now()}`
      const currentTime = new Date().toISOString()
      
      const newGoalLocal: Goal = {
        id: tempId,
        title: goalData.title,
        description: goalData.detail,
        assignee: goalData.assignee,
        dueDate: goalData.due_on,
        isCompleted: false,
        createdAt: currentTime,
        updatedAt: currentTime,
        comments: [],
        reactions: [],
        showDetails: false,
        newComment: ''
      }

      // ローカルに即座に追加（UI更新）
      goals.value.unshift(newGoalLocal)
      totalGoals.value++
      progressPercentage.value = totalGoals.value > 0 
        ? Math.round((completedGoals.value / totalGoals.value) * 100)
        : 0

      // フォームをリセットしてフォームを閉じる
      clearNewGoal()
      isAddingGoal.value = false

      // バックグラウンドでAPIに送信し、成功時に実際のデータで置き換え
      try {
        const result = await createGoal(spaceId.value, goalData)
        
        // 成功時：一時的な目標を実際のデータで置き換え
        const index = goals.value.findIndex(g => g.id === tempId)
        if (index !== -1) {
          goals.value[index] = {
            id: result.task_id || tempId,
            title: result.goal?.title || goalData.title,
            description: result.goal?.detail || goalData.detail,
            assignee: result.goal?.assignee || goalData.assignee,
            dueDate: result.goal?.due_on || goalData.due_on,
            isCompleted: result.goal?.status === 'done' || false,
            createdAt: result.goal?.created_at || currentTime,
            updatedAt: result.goal?.updated_at || currentTime,
            comments: [],
            reactions: [],
            showDetails: false,
            newComment: ''
          }
        }
        
        console.log('目標を作成しました:', result)
      } catch (apiError) {
        console.error('目標の作成に失敗:', apiError)
        
        // API失敗時：ローカルに追加した目標を削除し、エラー表示
        const index = goals.value.findIndex(g => g.id === tempId)
        if (index !== -1) {
          goals.value.splice(index, 1)
          totalGoals.value--
          progressPercentage.value = totalGoals.value > 0 
            ? Math.round((completedGoals.value / totalGoals.value) * 100)
            : 0
        }
        
        error.value = '目標の作成に失敗しました。再度お試しください。'
      }
    } catch (err) {
      console.error('目標の追加処理に失敗:', err)
      error.value = '目標の追加処理に失敗しました'
    }
  }

  const clearNewGoal = () => {
    newGoal.title = ''
    newGoal.assignee = ''
    newGoal.dueDate = ''
    newGoal.description = ''
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startAddingGoal = () => {
    isAddingGoal.value = true
  }

  const cancelAddingGoal = () => {
    isAddingGoal.value = false
    clearNewGoal()
  }

  // 初期化処理
  const initialize = async () => {
    try {
      // ルートパラメータからスペースIDを取得
      spaceId.value = route.params.spaceId as string

      if (!spaceId.value) {
        error.value = 'スペースIDが指定されていません'
        return
      }

      // スペース情報と目標一覧を並行して取得
      await Promise.all([
        fetchSpaceInfo(),
        fetchGoals()
      ])
    } catch (err) {
      console.error('初期化に失敗:', err)
      error.value = '初期化に失敗しました'
    }
  }

  onMounted(() => {
    initialize()
  })

  return {
    // 状態
    isAddingGoal,
    sortOrder,
    filters,
    newGoal,
    rules,
    spaceName,
    spaceDescription,
    members,
    goals,
    loading,
    error,
    
    // 計算プロパティ
    totalGoals,
    completedGoals,
    progressPercentage,
    assigneeOptions,
    statusOptions,
    filteredGoals,
    
    // メソッド
    toggleGoalStatus,
    showComments,
    addComment,
    toggleReaction,
    hasReaction,
    addGoal,
    clearNewGoal,
    formatDate,
    formatTime,
    startAddingGoal,
    cancelAddingGoal,
    
    // 再取得メソッド
    fetchGoals,
    fetchSpaceInfo
  }
}

export { default } from './goal-display.vue'
