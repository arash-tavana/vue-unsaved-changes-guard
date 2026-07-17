import type { MaybeRefOrGetter, Ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export type UnsavedChangesGuardTrigger = 'route-leave' | 'route-update'

export interface ConfirmNavigationParams {
  trigger: UnsavedChangesGuardTrigger
  to: RouteLocationNormalized
  from: RouteLocationNormalized
}

export interface UseUnsavedChangesGuardOptions {
  hasUnsavedChanges: MaybeRefOrGetter<boolean>
  confirmNavigation: (params: ConfirmNavigationParams) => boolean | Promise<boolean>
  enabled?: MaybeRefOrGetter<boolean>
  guardRouteUpdates?: boolean
  guardBeforeUnload?: boolean
}

export interface UseUnsavedChangesGuardReturn {
  isConfirming: Ref<boolean>
  bypassNextNavigation: () => void
}
