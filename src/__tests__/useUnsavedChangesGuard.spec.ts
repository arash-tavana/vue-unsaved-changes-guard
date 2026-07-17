import {defineComponent, ref} from 'vue';
import {mount, type VueWrapper} from '@vue/test-utils';
import type {RouteLocationNormalized} from 'vue-router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useUnsavedChangesGuard} from '../composables/useUnsavedChangesGuard';
import type {
  UseUnsavedChangesGuardOptions,
  UseUnsavedChangesGuardReturn
} from '../types';

type RouterGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => boolean | Promise<boolean>;

type RegisterRouterGuard = (guard: RouterGuard) => void;

type ConfirmNavigation =
  UseUnsavedChangesGuardOptions['confirmNavigation'];

const routerGuards = vi.hoisted(() => ({
  leave: vi.fn<RegisterRouterGuard>(),
  update: vi.fn<RegisterRouterGuard>()
}));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: routerGuards.leave,
  onBeforeRouteUpdate: routerGuards.update
}));

const to = {
  name: 'home'
} as RouteLocationNormalized;

const from = {
  name: 'edit'
} as RouteLocationNormalized;

let wrapper: VueWrapper | undefined;

const mountGuard = (options: UseUnsavedChangesGuardOptions) => {
  let guard!: UseUnsavedChangesGuardReturn;

  wrapper = mount(
    defineComponent({
      setup() {
        guard = useUnsavedChangesGuard(options);

        return () => null;
      }
    })
  );

  return guard;
};

const getLeaveGuard = () => {
  const guard = routerGuards.leave.mock.calls[0]?.[0];

  if (!guard) {
    throw new Error('Leave guard was not registered');
  }

  return guard;
};

const getUpdateGuard = () => {
  const guard = routerGuards.update.mock.calls[0]?.[0];

  if (!guard) {
    throw new Error('Update guard was not registered');
  }

  return guard;
};

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  it('allows navigation when there are no unsaved changes', async () => {
    const confirmNavigation = vi.fn<ConfirmNavigation>();

    mountGuard({
      hasUnsavedChanges: ref(false),
      confirmNavigation
    });

    const result = await getLeaveGuard()(to, from);

    expect(result).toBe(true);
    expect(confirmNavigation).not.toHaveBeenCalled();
  });

  it('uses the confirmation result when there are unsaved changes', async () => {
    const confirmNavigation =
      vi.fn<ConfirmNavigation>().mockResolvedValue(false);

    mountGuard({
      hasUnsavedChanges: ref(true),
      confirmNavigation
    });

    const result = await getLeaveGuard()(to, from);

    expect(result).toBe(false);
    expect(confirmNavigation).toHaveBeenCalledWith({
      trigger: 'route-leave',
      to,
      from
    });
  });

  it('bypasses only the next navigation', async () => {
    const confirmNavigation =
      vi.fn<ConfirmNavigation>().mockResolvedValue(false);

    const guard = mountGuard({
      hasUnsavedChanges: ref(true),
      confirmNavigation
    });

    const leaveGuard = getLeaveGuard();

    guard.bypassNextNavigation();

    expect(await leaveGuard(to, from)).toBe(true);
    expect(confirmNavigation).not.toHaveBeenCalled();

    expect(await leaveGuard(to, from)).toBe(false);
    expect(confirmNavigation).toHaveBeenCalledOnce();
  });

  it('updates the confirming state', async () => {
    let resolveConfirmation!: (result: boolean) => void;

    const confirmNavigation = vi.fn<ConfirmNavigation>(
      () =>
        new Promise<boolean>(resolve => {
          resolveConfirmation = resolve;
        })
    );

    const guard = mountGuard({
      hasUnsavedChanges: ref(true),
      confirmNavigation
    });

    const navigation = getLeaveGuard()(to, from);

    expect(guard.isConfirming.value).toBe(true);

    resolveConfirmation(true);

    await expect(navigation).resolves.toBe(true);
    expect(guard.isConfirming.value).toBe(false);
  });

  it('handles route updates', async () => {
    const confirmNavigation =
      vi.fn<ConfirmNavigation>().mockResolvedValue(true);

    mountGuard({
      hasUnsavedChanges: ref(true),
      confirmNavigation
    });

    const result = await getUpdateGuard()(to, from);

    expect(result).toBe(true);
    expect(confirmNavigation).toHaveBeenCalledWith({
      trigger: 'route-update',
      to,
      from
    });
  });

  it('does not register the route update guard when it is disabled', () => {
    mountGuard({
      hasUnsavedChanges: ref(true),
      confirmNavigation: vi.fn<ConfirmNavigation>(),
      guardRouteUpdates: false
    });

    expect(routerGuards.update).not.toHaveBeenCalled();
  });
});
