import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Goal, CreateGoalRequest } from '@/types'
import { getSpaceInfo } from '@/api/spaces'
import { getGoalList, createGoal } from '@/api/goals'

export const useGoalDisplay = () => {
  const route = useRoute()

  // 状態管理
  const showAddGoalDialog = ref(false)
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
  const isEditor = ref(false)
  const spaceId = ref('')
  const viewToken = ref('')
  const editToken = ref('')

  // 目標データ
  const goals = ref<Goal[]>([])
  const totalGoals = ref(0)
  const completedGoals = ref(0)
  const progressPercentage = ref(0)

  // 計算プロパティ
  const assigneeOptions = computed(() => {
    const assignees = goals.value
      .map((g: Goal) => g.assignee)
      .filter(Boolean) as string[]
    return [...new Set(assignees)]
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
          return a.title.localeCompare(b.title)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  })

  // APIからスペース情報を取得
  const fetchSpaceInfo = async () => {
    try {
      loading.value = true
      error.value = null

      if (!spaceId.value || !viewToken.value) {
        throw new Error('スペースIDまたはトークンが不足しています')
      }

      const spaceInfo = await getSpaceInfo(spaceId.value, viewToken.value)
      
      spaceName.value = spaceInfo.space.title
      spaceDescription.value = `メンバー数: ${spaceInfo.members.length}人`
      
      // 編集権限の確認（editTokenがあるかどうかで判定）
      isEditor.value = !!editToken.value
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
      
      // データ形式を変換
      totalGoals.value = goalList.total_count
      completedGoals.value = goalList.done_count
      progressPercentage.value = goalList.achievement_rate

      // 完了済みと未完了の目標を統合
      const allGoals: Goal[] = []

      // 完了済み目標を変換
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

      // 未完了目標を変換
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

      goals.value = allGoals
    } catch (err) {
      console.error('目標一覧の取得に失敗:', err)
      error.value = '目標一覧の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  // メソッド
  const toggleGoalStatus = async (goal: Goal) => {
    try {
      // TODO: 目標ステータス更新APIを実装
      goal.isCompleted = !goal.isCompleted
      goal.updatedAt = new Date().toISOString()
      
      if (goal.isCompleted) {
        completedGoals.value++
        totalGoals.value++
      } else {
        completedGoals.value--
        totalGoals.value--
      }
      
      // 進捗率を再計算
      progressPercentage.value = totalGoals.value > 0 
        ? Math.round((completedGoals.value / totalGoals.value) * 100)
        : 0
      
      console.log(`${goal.title} のステータスを更新しました`)
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

      if (!spaceId.value || !editToken.value) {
        error.value = '編集権限がありません'
        return
      }

      loading.value = true
      error.value = null

      // APIに送信するデータ形式に変換
      const goalData = {
        title: newGoal.title.trim(),
        detail: newGoal.description?.trim() || '',
        assignee: newGoal.assignee?.trim() || '',
        due_on: newGoal.dueDate || ''
      }

      // 目標を作成
      const result = await createGoal(spaceId.value, editToken.value, goalData)
      
      // 成功時は目標リストを再取得
      await fetchGoals()
      
      // フォームをリセット
      newGoal.title = ''
      newGoal.assignee = ''
      newGoal.dueDate = ''
      newGoal.description = ''
      
      showAddGoalDialog.value = false
      
      console.log('目標を作成しました:', result)
    } catch (err) {
      console.error('目標の作成に失敗:', err)
      error.value = '目標の作成に失敗しました'
    } finally {
      loading.value = false
    }
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

  // 初期化処理
  const initialize = async () => {
    try {
      // ルートパラメータからスペースIDとトークンを取得
      spaceId.value = route.params.spaceId as string
      viewToken.value = route.query.view_token as string
      editToken.value = route.query.edit_token as string

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
    showAddGoalDialog,
    sortOrder,
    filters,
    newGoal,
    rules,
    spaceName,
    spaceDescription,
    isEditor,
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
    formatDate,
    formatTime,
    
    // 再取得メソッド
    fetchGoals,
    fetchSpaceInfo
  }
}

export { default } from './goal-display.vue'
