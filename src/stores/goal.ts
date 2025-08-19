import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Goal {
  id: string
  title: string
  assignee?: string
  dueDate?: string
  description?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  comments: Comment[]
  reactions: Reaction[]
}

export interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
}

export interface Reaction {
  id: string
  type: 'like' | 'heart' | 'clap'
  author: string
  createdAt: string
}

export const useGoalStore = defineStore('goal', () => {
  const goals = ref<Goal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const completedGoals = computed(() => 
    goals.value.filter(goal => goal.isCompleted)
  )
  
  const pendingGoals = computed(() => 
    goals.value.filter(goal => !goal.isCompleted)
  )
  
  const completionRate = computed(() => {
    if (goals.value.length === 0) return 0
    return Math.round((completedGoals.value.length / goals.value.length) * 100)
  })

  const setGoals = (newGoals: Goal[]) => {
    goals.value = newGoals
  }

  const addGoal = (goal: Goal) => {
    goals.value.push(goal)
  }

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const index = goals.value.findIndex(goal => goal.id === id)
    if (index !== -1) {
      goals.value[index] = { ...goals.value[index], ...updates }
    }
  }

  const toggleGoalCompletion = (id: string) => {
    const goal = goals.value.find(g => g.id === id)
    if (goal) {
      goal.isCompleted = !goal.isCompleted
    }
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  return {
    goals,
    loading,
    error,
    completedGoals,
    pendingGoals,
    completionRate,
    setGoals,
    addGoal,
    updateGoal,
    toggleGoalCompletion,
    setLoading,
    setError
  }
})
