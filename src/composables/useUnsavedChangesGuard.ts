import { onMounted, onUnmounted } from 'vue'
import type { UnsavedChangesGuardOptions } from '@/types/unsavedChangesGuard'

export function useUnsavedChangesGuard({ isDirty, confirmLeave }: UnsavedChangesGuardOptions) {
  void confirmLeave
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!isDirty.value) return

    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
}
