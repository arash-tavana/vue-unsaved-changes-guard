import { defineComponent, toRef, type PropType } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
}))

const TestComponent = defineComponent({
  props: {
    isDirty: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    confirmLeave: {
      type: Function as PropType<() => boolean | Promise<boolean>>,
      required: false,
    },
  },

  setup(props) {
    return useUnsavedChangesGuard({
      isDirty: toRef(props, 'isDirty'),
      message: props.message,
      confirmLeave: props.confirmLeave,
    })
  },

  template: '<div />',
})

const createWrapper = (
  isDirty: boolean,
  message?: string,
  confirmLeave?: () => boolean | Promise<boolean>,
) => {
  return mount(TestComponent, {
    props: {
      isDirty,
      message,
      confirmLeave,
    },
  })
}

describe('useUnsavedChangesGuard', () => {
  it('allows leaving when there are no unsaved changes', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    const wrapper = createWrapper(false)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(true)
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('prevents leaving when the user cancels the confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const wrapper = createWrapper(true)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(false)
    expect(confirmSpy).toHaveBeenCalledOnce()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('allows leaving when the user confirms leaving', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = createWrapper(true)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(true)
    expect(confirmSpy).toHaveBeenCalledOnce()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('uses the custom confirmation message', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = createWrapper(true, 'You have unsaved changes')
    await wrapper.vm.canLeave()

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes')

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('uses the custom confirmLeave function', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const confirmLeave = vi.fn().mockReturnValue(true)
    const wrapper = createWrapper(true, undefined, confirmLeave)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(true)
    expect(confirmLeave).toHaveBeenCalledOnce()
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('prevents leaving when the custom confirmLeave function returns false', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const confirmLeave = vi.fn().mockReturnValue(false)

    const wrapper = createWrapper(true, undefined, confirmLeave)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(false)
    expect(confirmLeave).toHaveBeenCalledOnce()
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('allows leaving when the async confirmLeave function resolves true', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const confirmLeave = vi.fn().mockResolvedValue(true)

    const wrapper = createWrapper(true, undefined, confirmLeave)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(true)
    expect(confirmLeave).toHaveBeenCalledOnce()
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('prevents leaving when the async confirmLeave function resolves false', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const confirmLeave = vi.fn().mockResolvedValue(false)

    const wrapper = createWrapper(true, undefined, confirmLeave)
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(false)
    expect(confirmLeave).toHaveBeenCalledOnce()
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })
})
