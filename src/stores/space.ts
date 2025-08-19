import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Space {
  id: string
  name: string
  description?: string
  members: string[]
  createdAt: string
  updatedAt: string
}

export interface SpaceToken {
  spaceId: string
  type: 'viewer' | 'editor'
  token: string
}

export const useSpaceStore = defineStore('space', () => {
  const currentSpace = ref<Space | null>(null)
  const viewerToken = ref<string | null>(null)
  const editorToken = ref<string | null>(null)

  const isEditor = computed(() => !!editorToken.value)
  const isViewer = computed(() => !!viewerToken.value)

  const setCurrentSpace = (space: Space) => {
    currentSpace.value = space
  }

  const setTokens = (tokens: { viewer?: string; editor?: string }) => {
    if (tokens.viewer) viewerToken.value = tokens.viewer
    if (tokens.editor) editorToken.value = tokens.editor
  }

  const clearTokens = () => {
    viewerToken.value = null
    editorToken.value = null
    currentSpace.value = null
  }

  return {
    currentSpace,
    viewerToken,
    editorToken,
    isEditor,
    isViewer,
    setCurrentSpace,
    setTokens,
    clearTokens
  }
})
