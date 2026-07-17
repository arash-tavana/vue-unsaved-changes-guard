import { onMounted, onUnmounted } from 'vue'
import type { UnsavedChangesGuardOptions } from '@/types/unsavedChangesGuard'
import { onBeforeRouteLeave } from 'vue-router'

export function useUnsavedChangesGuard({
  isDirty,
  confirmLeave,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: UnsavedChangesGuardOptions) {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!isDirty.value) return

    event.preventDefault()
    event.returnValue = ''
  }

  const canLeave = async (): Promise<boolean> => {
    if (!isDirty.value) return true

    if (confirmLeave) return confirmLeave()
    return window.confirm(message)
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeRouteLeave(canLeave)

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    canLeave,
  }
}
