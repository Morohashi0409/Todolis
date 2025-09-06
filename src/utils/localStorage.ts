// LocalStorage管理ユーティリティ

export interface RecentGroup {
  id: string
  name: string
  description?: string
  memberCount: number
  lastVisited: Date
  linkId?: string
}

const RECENT_GROUPS_KEY = 'todolis_recent_groups'
const MAX_RECENT_GROUPS = 5

// 最近のグループ一覧を取得
export const getRecentGroups = (): RecentGroup[] => {
  try {
    const stored = localStorage.getItem(RECENT_GROUPS_KEY)
    if (!stored) return []
    
    const groups = JSON.parse(stored) as RecentGroup[]
    // 日付を Date オブジェクトに変換
    return groups.map(group => ({
      ...group,
      lastVisited: new Date(group.lastVisited)
    })).sort((a, b) => b.lastVisited.getTime() - a.lastVisited.getTime())
  } catch (error) {
    console.error('Failed to load recent groups:', error)
    return []
  }
}

// 最近のグループに追加または更新
export const addRecentGroup = (group: Omit<RecentGroup, 'lastVisited'>): void => {
  try {
    const existingGroups = getRecentGroups()
    
    // 既存のグループを除外
    const filteredGroups = existingGroups.filter(existing => existing.id !== group.id)
    
    // 新しいグループを先頭に追加
    const newGroup: RecentGroup = {
      ...group,
      lastVisited: new Date()
    }
    
    const updatedGroups = [newGroup, ...filteredGroups].slice(0, MAX_RECENT_GROUPS)
    
    localStorage.setItem(RECENT_GROUPS_KEY, JSON.stringify(updatedGroups))
  } catch (error) {
    console.error('Failed to save recent group:', error)
  }
}

// 特定のグループを最近のグループから削除
export const removeRecentGroup = (groupId: string): void => {
  try {
    const existingGroups = getRecentGroups()
    const filteredGroups = existingGroups.filter(group => group.id !== groupId)
    
    localStorage.setItem(RECENT_GROUPS_KEY, JSON.stringify(filteredGroups))
  } catch (error) {
    console.error('Failed to remove recent group:', error)
  }
}

// 最近のグループを全て削除
export const clearRecentGroups = (): void => {
  try {
    localStorage.removeItem(RECENT_GROUPS_KEY)
  } catch (error) {
    console.error('Failed to clear recent groups:', error)
  }
}
