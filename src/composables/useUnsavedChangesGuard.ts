import { onBeforeUnmount, ref, toValue, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, type RouteLocationNormalized } from 'vue-router'
import type {
  UnsavedChangesGuardTrigger,
  UseUnsavedChangesGuardOptions,
  UseUnsavedChangesGuardReturn,
} from '../types'

export const useUnsavedChangesGuard = ({
  hasUnsavedChanges,
  confirmNavigation,
  enabled = true,
  guardRouteUpdates = true,
  guardBeforeUnload = true,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardReturn => {
  const isConfirming = ref(false)

  let shouldBypassNextNavigation = false
  let isBeforeUnloadRegistered = false

  const shouldBlockNavigation = () => {
    return toValue(enabled) && toValue(hasUnsavedChanges)
  }

  const bypassNextNavigation = () => {
    shouldBypassNextNavigation = true
  }

  const handleRouteNavigation = async (
    trigger: UnsavedChangesGuardTrigger,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ) => {
    if (shouldBypassNextNavigation) {
      shouldBypassNextNavigation = false

      return true
    }

    if (!shouldBlockNavigation()) {
      return true
    }

    if (isConfirming.value) {
      return false
    }

    isConfirming.value = true

    try {
      return await confirmNavigation({
        trigger,
        to,
        from,
      })
    } finally {
      isConfirming.value = false
    }
  }

  onBeforeRouteLeave((to, from) => {
    return handleRouteNavigation('route-leave', to, from)
  })

  if (guardRouteUpdates) {
    onBeforeRouteUpdate((to, from) => {
      return handleRouteNavigation('route-update', to, from)
    })
  }

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ' '
  }

  const addBeforeUnloadListener = () => {
    if (typeof window === 'undefined' || isBeforeUnloadRegistered) {
      return
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    isBeforeUnloadRegistered = true
  }

  const removeBeforeUnloadListener = () => {
    if (typeof window === 'undefined' || !isBeforeUnloadRegistered) {
      return
    }

    window.removeEventListener('beforeunload', handleBeforeUnload)
    isBeforeUnloadRegistered = false
  }

  if (guardBeforeUnload) {
    watch(
      shouldBlockNavigation,
      (hasChanges) => {
        if (hasChanges) {
          addBeforeUnloadListener()

          return
        }

        removeBeforeUnloadListener()
      },
      {
        immediate: true,
      },
    )
  }

  onBeforeUnmount(() => {
    removeBeforeUnloadListener()
  })

  return {
    isConfirming,
    bypassNextNavigation,
  }
}
