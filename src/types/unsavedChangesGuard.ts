import type { Ref } from 'vue'

export interface UnsavedChangesGuardOptions {
  isDirty: Ref<boolean>
  confirmLeave?: () => boolean | Promise<boolean>
  message?: string
}
