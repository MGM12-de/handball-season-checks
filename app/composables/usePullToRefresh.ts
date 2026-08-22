const PULL_THRESHOLD = 70
const MAX_PULL = 120
const RESISTANCE = 0.5

/**
 * Native-app-style pull-to-refresh via touch events. Only activates when the
 * page is scrolled to the top and the user drags down; releases past
 * `PULL_THRESHOLD` trigger `onRefresh`.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown> | unknown) {
  const pullDistance = ref(0)
  const isPulling = ref(false)
  const isRefreshing = ref(false)

  const pullProgress = computed(() => Math.min(pullDistance.value / PULL_THRESHOLD, 1))

  let startY = 0
  let tracking = false

  function onTouchStart(event: TouchEvent) {
    if (isRefreshing.value || window.scrollY > 0 || !event.touches[0]) {
      return
    }

    startY = event.touches[0].clientY
    tracking = true
  }

  function onTouchMove(event: TouchEvent) {
    if (!tracking || isRefreshing.value || !event.touches[0]) {
      return
    }

    const delta = event.touches[0].clientY - startY

    if (delta <= 0) {
      isPulling.value = false
      pullDistance.value = 0
      return
    }

    if (window.scrollY > 0) {
      tracking = false
      isPulling.value = false
      pullDistance.value = 0
      return
    }

    isPulling.value = true
    pullDistance.value = Math.min(delta * RESISTANCE, MAX_PULL)

    if (event.cancelable) {
      event.preventDefault()
    }
  }

  async function onTouchEnd() {
    if (!tracking) {
      return
    }

    tracking = false
    isPulling.value = false

    if (pullDistance.value >= PULL_THRESHOLD) {
      isRefreshing.value = true
      pullDistance.value = PULL_THRESHOLD

      try {
        await onRefresh()
      }
      finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    }
    else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
  })

  return { pullDistance, isPulling, isRefreshing, pullProgress }
}
