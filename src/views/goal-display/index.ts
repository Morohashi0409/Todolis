import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Goal, CreateGoalRequest } from '@/types'
import { getSpaceInfo, updateSpace } from '@/api/spaces'
import { getGoalList, createGoal, updateGoalStatus } from '@/api/goals'
import { addRecentGroup } from '@/utils/localStorage'
// import { getReactionList, addReaction } from '@/api/reactions'
import type { UpdateSpaceRequest } from '@/api/types'
import { useSwipeGesture } from '@/utils/useSwipeGesture'

export const useGoalDisplay = () => {
  const route = useRoute()

  // 状態管理
  const isAddingGoal = ref(false)
  const isEditingSpace = ref(false)
  const sortOrder = ref('dueDate')
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

  // スペース編集フォーム
  const editSpaceData = reactive<UpdateSpaceRequest>({
    title: '',
    members_to_add: []
  })
  const editSpaceMemberList = ref<string[]>([])
  const currentEditMemberInput = ref('')

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

  // スワイプアニメーション状態
  const swipeAnimations = ref<Map<string, string>>(new Map())
  // 提供するリアクション（5種） - 一時的にコメントアウト
  // const REACTION_EMOJIS = ['👍', '❤️', '👏', '🎉', '🔥']

  // const getReactionCountFor = (goal: Goal, emoji: string): number => {
  //   const list = (goal as any).reactions || []
  //   return list.filter((r: any) => r.emoji === emoji).length
  // }

  // const fetchReactionsForGoal = async (goal: Goal) => {
  //   try {
  //     const res = await getReactionList(goal.id)
  //     ;(goal as any).reactions = res.reactions || []
  //   } catch (err) {
  //     // 反応取得は致命的でないため握りつぶす
  //     ;(goal as any).reactions = []
  //   }
  // }

  // const reactToGoal = async (goal: Goal, emoji: string) => {
  //   try {
  //     await addReaction(goal.id, emoji)
  //     await fetchReactionsForGoal(goal)
  //   } catch (err) {
  //     console.error('リアクション送信に失敗:', err)
  //   }
  // }

  // 長押しピッカー用の状態とハンドラ - 一時的にコメントアウト
  // const reactionPickerVisible = ref(false)
  // const reactionPickerX = ref(0)
  // const reactionPickerY = ref(0)
  // const reactionPickerGoalId = ref<string | null>(null)
  // let longPressTimer: number | undefined
  // const longPressFired = ref(false)

  // const openReactionPicker = (goal: Goal, x: number, y: number) => {
  //   console.log('openReactionPicker called:', { goal: goal.title, x, y })
  //   reactionPickerGoalId.value = goal.id
  //   reactionPickerX.value = x
  //   reactionPickerY.value = y
  //   reactionPickerVisible.value = true
  //   longPressFired.value = true
  //   console.log('reactionPickerVisible set to:', reactionPickerVisible.value)
    
  //   // ピッカーが表示された後の実際の位置を確認
  //   setTimeout(() => {
  //     const pickerElement = document.querySelector('.reaction-picker') as HTMLElement
  //     if (pickerElement) {
  //       const pickerRect = pickerElement.getBoundingClientRect()
  //       console.log('Actual picker position:', {
  //         top: pickerRect.top,
  //         left: pickerRect.left,
  //         bottom: pickerRect.bottom,
  //         right: pickerRect.right,
  //         width: pickerRect.width,
  //         height: pickerRect.height
  //       })
  //     }
  //   }, 100)
  // }

  // const closeReactionPicker = () => {
  //   reactionPickerVisible.value = false
  //   reactionPickerGoalId.value = null
  // }

  // const startLongPress = (goal: Goal, evt: MouseEvent | TouchEvent) => {
  //   clearTimeout(longPressTimer as any)
  //   longPressFired.value = false
  //   const getPoint = () => {
  //     if ('touches' in evt && evt.touches && evt.touches[0]) {
  //       return { x: evt.touches[0].clientX, y: evt.touches[0].clientY }
  //     }
  //     const me = evt as MouseEvent
  //     return { x: me.clientX, y: me.clientY }
  //   }
  //   const { x, y } = getPoint()
  //   longPressTimer = window.setTimeout(() => openReactionPicker(goal, x, y), 450)
  // }

  // const cancelLongPress = () => {
  //   // 長押しがまだ発火していない場合のみキャンセル
  //   if (!longPressFired.value) {
  //     clearTimeout(longPressTimer as any)
  //   }
  // }

  // const chooseReactionFromPicker = async (emoji: string) => {
  //   try {
  //     const goal = goals.value.find(g => g.id === reactionPickerGoalId.value)
  //     if (!goal) return
  //     await reactToGoal(goal, emoji)
  //   } finally {
  //     closeReactionPicker()
  //   }
  // }

  // タップ/クリックで即ピッカーを表示（目標カードの上に表示） - 一時的にコメントアウト
  // const handleCardClick = (goal: Goal, evt: MouseEvent | TouchEvent) => {
  //   console.log('handleCardClick called:', { goal: goal.title, eventType: evt.type })
    
  //   // 目標カードの要素を取得
  //   const goalCard = (evt.target as HTMLElement).closest('.goal-card') as HTMLElement
  //   console.log('goalCard found:', goalCard)
    
  //   if (!goalCard) {
  //     console.log('goalCard not found, returning')
  //     return
  //   }
    
  //   // 目標カードの位置を取得
  //   const rect = goalCard.getBoundingClientRect()
  //   console.log('getBoundingClientRect():', {
  //     top: rect.top,
  //     left: rect.left,
  //     bottom: rect.bottom,
  //     right: rect.right,
  //     width: rect.width,
  //     height: rect.height
  //   })
    
  //   const x = rect.left + rect.width / 2 // カードの中央
  //   const y = rect.top - 30 // カードの上端から30px上に設定（ピッカーの高さ分を考慮）
    
  //   console.log('Opening reaction picker at:', { x, y })
  //   openReactionPicker(goal, x, y)
  // }


  // スワイプ機能用のヘルパー
  const createSwipeHandler = (goal: Goal) => {
    return useSwipeGesture({
      threshold: 40, // iPhone用により小さな閾値
      maxDistance: 100, // iPhone用により小さな最大距離
      onSwipeLeft: () => {
        // 左スワイプ：TODOに戻す（完了済みの場合のみ）
        if (goal.isCompleted) {
          performSwipeAction(goal, false, 'left')
        }
      },
      onSwipeRight: () => {
        // 右スワイプ：完了にする（未完了の場合のみ）
        if (!goal.isCompleted) {
          performSwipeAction(goal, true, 'right')
        }
      },
      onSwipeProgress: (progress: number, direction: 'left' | 'right' | 'none') => {
        // スワイプ中の視覚的フィードバック
        updateSwipeVisuals(goal.id, progress, direction)
      },
      onSwipeEnd: () => {
        // スワイプ終了時の状態リセット
        resetSwipeVisuals(goal.id)
      }
    })
  }

  const performSwipeAction = async (goal: Goal, _newStatus: boolean, direction: 'left' | 'right') => {
    // アニメーションクラスを追加
    swipeAnimations.value.set(goal.id, `swipe-complete-${direction}`)
    
    // 少し待ってからステータス更新
    setTimeout(async () => {
      await toggleGoalStatus(goal)
      
      // アニメーション完了後にクラスを削除
      setTimeout(() => {
        swipeAnimations.value.delete(goal.id)
      }, 600)
    }, 100)
  }

  const updateSwipeVisuals = (goalId: string, progress: number, direction: 'left' | 'right' | 'none') => {
    const goalElement = document.querySelector(`[data-goal-id="${goalId}"]`)
    if (!goalElement) return

    const content = goalElement.querySelector('.goal-content') as HTMLElement
    const backgroundLeft = goalElement.querySelector('.swipe-background.swipe-left') as HTMLElement
    const backgroundRight = goalElement.querySelector('.swipe-background.swipe-right') as HTMLElement

    if (direction === 'right' && backgroundRight) {
      // 右スワイプ（完了）- より小さな移動でもフィードバック
      backgroundRight.style.opacity = (progress * 0.95).toString()
      if (progress > 0.2) { // より低い閾値でアクティブに
        backgroundRight.classList.add('active')
      } else {
        backgroundRight.classList.remove('active')
      }
      content.style.transform = `translateX(${progress * 30}px)` // より小さな移動距離
    } else if (direction === 'left' && backgroundLeft) {
      // 左スワイプ（未完了）- より小さな移動でもフィードバック
      backgroundLeft.style.opacity = (progress * 0.95).toString()
      if (progress > 0.2) { // より低い閾値でアクティブに
        backgroundLeft.classList.add('active')
      } else {
        backgroundLeft.classList.remove('active')
      }
      content.style.transform = `translateX(-${progress * 30}px)` // より小さな移動距離
    }

    // スワイプ中のクラス追加
    if (progress > 0) {
      content.classList.add('swiping')
    } else {
      content.classList.remove('swiping')
    }
  }

  const resetSwipeVisuals = (goalId: string) => {
    const goalElement = document.querySelector(`[data-goal-id="${goalId}"]`)
    if (!goalElement) return

    const content = goalElement.querySelector('.goal-content') as HTMLElement
    const backgroundLeft = goalElement.querySelector('.swipe-background.swipe-left') as HTMLElement
    const backgroundRight = goalElement.querySelector('.swipe-background.swipe-right') as HTMLElement

    // 全ての状態をリセット
    content.style.transform = ''
    content.classList.remove('swiping')
    
    if (backgroundLeft) {
      backgroundLeft.style.opacity = '0'
      backgroundLeft.classList.remove('active')
    }
    
    if (backgroundRight) {
      backgroundRight.style.opacity = '0'
      backgroundRight.classList.remove('active')
    }
  }

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
      
      // LocalStorageに最近のグループとして保存
      addRecentGroup({
        id: spaceId.value,
        name: spaceInfo.space.title,
        description: `メンバー数: ${spaceInfo.members.length}人`,
        memberCount: spaceInfo.members.length,
        linkId: route.params.linkId as string
      })
      
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
      
      console.log('API Response:', goalList) // デバッグログ追加
      
      // データ形式を変換（安全に取得）
      totalGoals.value = goalList.total_count || 0
      completedGoals.value = goalList.done_count || 0
      progressPercentage.value = goalList.achievement_rate || 0

      // 完了済みと未完了の目標を統合
      const allGoals: Goal[] = []

      // 完了済み目標を変換
      if (goalList.done_tasks && Array.isArray(goalList.done_tasks)) {
        goalList.done_tasks.forEach((task: any) => {
          console.log('Done task:', task) // デバッグログ追加
          allGoals.push({
            id: task.id,
            title: task.title || task.detail, // titleがない場合はdetailを使用
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
          console.log('Todo task:', task) // デバッグログ追加
          allGoals.push({
            id: task.id,
            title: task.title || task.detail, // titleがない場合はdetailを使用
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

      // 各ゴールのリアクションを並列取得 - 一時的にコメントアウト
      // try {
      //   await Promise.all(goals.value.map(g => fetchReactionsForGoal(g)))
      // } catch (_) {}
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

  // リロードボタン用：目標一覧を再取得
  const refreshGoals = async () => {
    console.log('リロードボタンが押されました - 目標一覧を再取得します')
    await fetchGoals()
  }

  // メソッド
  const toggleGoalStatus = async (goal: Goal) => {
    console.log('toggleGoalStatus called with goal:', {
      id: goal.id,
      title: goal.title,
      isCompleted: goal.isCompleted
    })
    
    // temp_idの場合は処理を停止
    if (!goal.id || goal.id.toString().startsWith('temp_')) {
      console.warn('一時的なIDの目標はステータス更新できません:', goal)
      error.value = '作成中の目標です。しばらくお待ちください。'
      return
    }
    
    try {
      // 現在の状態を保存（ロールバック用）
      const oldStatus = goal.isCompleted
      const oldCompleted = completedGoals.value
      
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
      
      console.log(`${goal.title} のステータスを更新しました:`, {
        oldStatus,
        newStatus: goal.isCompleted,
        oldCompleted,
        newCompleted: completedGoals.value,
        progressPercentage: progressPercentage.value
      })
      
      // バックエンドAPIを非同期で呼び出し
      try {
        const newStatus: 'todo' | 'done' = goal.isCompleted ? 'done' : 'todo'
        console.log(`Calling API with goal ID: ${goal.id}, status: ${newStatus}`)
        
        // goalオブジェクトをAPI用の形式に変換
        const apiGoal = {
          id: goal.id,
          space_id: spaceId.value,
          title: goal.title,
          detail: goal.description || '',
          assignee: goal.assignee || '',
          due_on: goal.dueDate || '',
          status: goal.isCompleted ? 'done' as const : 'todo' as const,
          order_index: 0,
          created_at: goal.createdAt,
          updated_at: goal.updatedAt
        }
        
        const result = await updateGoalStatus(goal.id, newStatus, apiGoal)
        
        console.log(`${goal.title} のAPIステータス更新が成功しました:`, result.message)
        
        // サーバーからの応答で目標データを更新（必要に応じて）
        if (result.goal) {
          goal.title = result.goal.title || goal.title
          goal.description = result.goal.detail || goal.description
          goal.assignee = result.goal.assignee || goal.assignee
          goal.dueDate = result.goal.due_on || goal.dueDate
          goal.isCompleted = result.goal.status === 'done'
          goal.updatedAt = result.goal.updated_at || goal.updatedAt
        }
        
      } catch (apiError: any) {
        console.error('APIステータス更新に失敗:', apiError)
        
        // API失敗時：ローカルの変更をロールバック
        goal.isCompleted = oldStatus
        goal.updatedAt = new Date().toISOString()
        
        // 進捗データもロールバック
        completedGoals.value = oldCompleted
        
        // 進捗率を再計算
        progressPercentage.value = totalGoals.value > 0 
          ? Math.round((completedGoals.value / totalGoals.value) * 100)
          : 0
        
        // エラーメッセージを表示
        if (apiError.response?.status === 404) {
          error.value = '目標が見つかりません。削除された可能性があります。'
        } else if (apiError.response?.status >= 500) {
          error.value = 'サーバーエラーが発生しました。しばらく経ってから再試行してください。'
        } else {
          error.value = '目標の更新に失敗しました。ネットワーク接続を確認してください。'
        }
      }
      
    } catch (err) {
      console.error('目標ステータスの更新に失敗:', err)
      error.value = '目標ステータスの更新処理に失敗しました'
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

      // バックグラウンドでAPIに送信し、成功時に一覧を再取得
      try {
        const result = await createGoal(spaceId.value, goalData)
        console.log('目標を作成しました:', result)
        
        // 成功時：temp_idを避けるため一覧を再取得
        await fetchGoals()
        
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

  // スペース編集関連のメソッド
  const startEditingSpace = () => {
    // 現在のスペース情報をフォームに設定
    editSpaceData.title = spaceName.value
    editSpaceMemberList.value = [...members.value]
    currentEditMemberInput.value = ''
    isEditingSpace.value = true
  }

  const cancelEditingSpace = () => {
    isEditingSpace.value = false
    editSpaceData.title = ''
    editSpaceData.members_to_add = []
    editSpaceMemberList.value = []
    currentEditMemberInput.value = ''
  }

  const addEditMember = () => {
    if (currentEditMemberInput.value.trim()) {
      editSpaceMemberList.value.push(currentEditMemberInput.value.trim())
      currentEditMemberInput.value = ''
    }
  }

  const removeEditMember = (index: number) => {
    editSpaceMemberList.value.splice(index, 1)
  }

  const saveSpaceEdit = async () => {
    try {
      if (!editSpaceData.title || !editSpaceData.title.trim()) {
        error.value = 'スペース名を入力してください'
        return
      }

      if (editSpaceMemberList.value.length === 0) {
        error.value = 'メンバーを1人以上追加してください'
        return
      }

      loading.value = true
      error.value = null

      // API呼び出し
      // 既存メンバーと新規メンバーを比較して、新規メンバーのみを抽出
      const currentMembers = members.value || []
      const newMembersOnly = editSpaceMemberList.value.filter(member => 
        !currentMembers.includes(member)
      )

      console.log('現在のメンバー:', currentMembers)
      console.log('編集フォームのメンバー:', editSpaceMemberList.value)
      console.log('新規メンバーのみ:', newMembersOnly)

      const updateData: UpdateSpaceRequest = {
        title: editSpaceData.title.trim(),
        members_to_add: newMembersOnly
      }

      await updateSpace(spaceId.value, updateData)
      
      // 成功後、スペース情報を再取得
      await fetchSpaceInfo()
      
      // フォームを閉じる
      cancelEditingSpace()
      
    } catch (err) {
      console.error('スペース更新に失敗:', err)
      error.value = 'スペースの更新に失敗しました'
    } finally {
      loading.value = false
    }
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
    isEditingSpace,
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
    
    // スペース編集関連の状態
    editSpaceData,
    editSpaceMemberList,
    currentEditMemberInput,
    
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
    
    // スペース編集メソッド
    startEditingSpace,
    cancelEditingSpace,
    addEditMember,
    removeEditMember,
    saveSpaceEdit,
    
    // 再取得メソッド
    fetchGoals,
    fetchSpaceInfo,
    refreshGoals,
    
    // スワイプ関連
    createSwipeHandler,
    swipeAnimations
    // リアクション機能 - 一時的にコメントアウト
    // ,
    // REACTION_EMOJIS,
    // getReactionCountFor,
    // reactToGoal
    // ,
    // リアクションピッカー
    // reactionPickerVisible,
    // reactionPickerX,
    // reactionPickerY,
    // startLongPress,
    // cancelLongPress,
    // chooseReactionFromPicker
    // ,
    // closeReactionPicker
    // ,
    // handleCardClick
  }
}

export { default } from './goal-display.vue'
