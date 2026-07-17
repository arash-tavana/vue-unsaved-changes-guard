import type { UnsavedChangesGuardOptions } from '@/types/unsavedChangesGuard'

export function useUnsavedChangesGuard({ isDirty }: UnsavedChangesGuardOptions) {
  void isDirty
}
