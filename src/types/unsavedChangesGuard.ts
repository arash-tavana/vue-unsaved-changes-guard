import type { Ref } from 'vue'

export interface UnsavedChangesGuardOptions {
  isDirty: Ref<boolean>
}
