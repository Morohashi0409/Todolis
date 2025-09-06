import { ref, reactive } from 'vue'

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
  swipeDirection: 'left' | 'right' | 'none'
  swipeDistance: number
  swipeProgress: number // 0-1の進捗
}

interface SwipeOptions {
  threshold?: number // スワイプ判定の閾値（ピクセル）
  maxDistance?: number // 最大スワイプ距離
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeProgress?: (progress: number, direction: 'left' | 'right' | 'none') => void
  onSwipeEnd?: () => void
}

export const useSwipeGesture = (options: SwipeOptions = {}) => {
  const {
    threshold = 50, // より小さな閾値（iPhone対応）
    maxDistance = 120, // より小さな最大距離
    onSwipeLeft,
    onSwipeRight,
    onSwipeProgress,
    onSwipeEnd
  } = options

  const swipeState = reactive<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    swipeDirection: 'none',
    swipeDistance: 0,
    swipeProgress: 0
  })

  const isValidSwipe = ref(false)

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    swipeState.startX = touch.clientX
    swipeState.startY = touch.clientY
    swipeState.currentX = touch.clientX
    swipeState.currentY = touch.clientY
    swipeState.isDragging = true
    swipeState.swipeDirection = 'none'
    swipeState.swipeDistance = 0
    swipeState.swipeProgress = 0
    isValidSwipe.value = false
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (!swipeState.isDragging) return

    const touch = event.touches[0]
    swipeState.currentX = touch.clientX
    swipeState.currentY = touch.clientY

    const deltaX = swipeState.currentX - swipeState.startX
    const deltaY = Math.abs(swipeState.currentY - swipeState.startY)

    // より寛容な垂直方向の判定（iPhone対応）
    if (deltaY > 80 && Math.abs(deltaX) < deltaY) {
      return
    }

    swipeState.swipeDistance = Math.abs(deltaX)
    swipeState.swipeProgress = Math.min(swipeState.swipeDistance / maxDistance, 1)

    // より小さな初期移動でスワイプを開始（iPhone対応）
    if (Math.abs(deltaX) > 5) {
      swipeState.swipeDirection = deltaX > 0 ? 'right' : 'left'
      isValidSwipe.value = swipeState.swipeDistance > threshold
    }

    // プログレスコールバックを呼び出し
    if (onSwipeProgress) {
      onSwipeProgress(swipeState.swipeProgress, swipeState.swipeDirection)
    }

    // より小さな移動でスクロールを防ぐ（iPhone対応）
    if (Math.abs(deltaX) > 5) {
      event.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!swipeState.isDragging) return

    // スワイプが有効で閾値を超えている場合、対応するコールバックを実行
    if (isValidSwipe.value && swipeState.swipeDistance > threshold) {
      if (swipeState.swipeDirection === 'left' && onSwipeLeft) {
        onSwipeLeft()
      } else if (swipeState.swipeDirection === 'right' && onSwipeRight) {
        onSwipeRight()
      }
    }

    // 状態をリセット
    swipeState.isDragging = false
    swipeState.swipeDirection = 'none'
    swipeState.swipeDistance = 0
    swipeState.swipeProgress = 0
    isValidSwipe.value = false

    // スワイプ終了コールバック
    if (onSwipeEnd) {
      onSwipeEnd()
    }
  }

  const getTouchEventHandlers = () => ({
    onTouchstart: handleTouchStart,
    onTouchmove: handleTouchMove,
    onTouchend: handleTouchEnd,
    onTouchcancel: handleTouchEnd
  })

  return {
    swipeState,
    isValidSwipe,
    getTouchEventHandlers
  }
}
