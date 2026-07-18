import { defineComponent, toRef, type PropType } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'
import { onBeforeRouteLeave } from 'vue-router'

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

const createWrapper = ({
  isDirty,
  message,
  confirmLeave,
}: {
  isDirty: boolean
  message?: string
  confirmLeave?: () => boolean | Promise<boolean>
}) => {
  return mount(TestComponent, {
    props: {
      isDirty,
      message,
      confirmLeave,
    },
  })
}

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a route leave guard', () => {
    const wrapper = createWrapper({
      isDirty: true,
    })

    expect(onBeforeRouteLeave).toHaveBeenCalledOnce()
    expect(onBeforeRouteLeave).toHaveBeenCalledWith(wrapper.vm.canLeave)

    wrapper.unmount()
  })

  it('uses the default confirmation message', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = createWrapper({
      isDirty: true,
    })

    await wrapper.vm.canLeave()

    expect(confirmSpy).toHaveBeenCalledWith(
      'You have unsaved changes. Are you sure you want to leave?',
    )

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('allows leaving when there are no unsaved changes', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    const wrapper = createWrapper({ isDirty: false })
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(true)
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('prevents leaving when the user cancels the confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const wrapper = createWrapper({ isDirty: true })
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(false)
    expect(confirmSpy).toHaveBeenCalledOnce()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('allows leaving when the user confirms leaving', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = createWrapper({ isDirty: true })
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(true)
    expect(confirmSpy).toHaveBeenCalledOnce()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('uses the custom confirmation message', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = createWrapper({ isDirty: true, message: 'You have unsaved changes' })
    await wrapper.vm.canLeave()

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes')

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('uses the custom confirmLeave function', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const confirmLeave = vi.fn().mockReturnValue(true)
    const wrapper = createWrapper({ isDirty: true, confirmLeave })
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

    const wrapper = createWrapper({ isDirty: true, confirmLeave })
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

    const wrapper = createWrapper({ isDirty: true, confirmLeave })
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

    const wrapper = createWrapper({ isDirty: true, confirmLeave })
    const result = await wrapper.vm.canLeave()

    expect(result).toBe(false)
    expect(confirmLeave).toHaveBeenCalledOnce()
    expect(confirmSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  it('does not prevent page unload when there are no unsaved changes', () => {
    const wrapper = createWrapper({
      isDirty: false,
    })

    const event = new Event('beforeunload', {
      cancelable: true,
    })

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)

    preventDefaultSpy.mockRestore()
    wrapper.unmount()
  })

  it('prevents page unload when there are unsaved changes', () => {
    const wrapper = createWrapper({
      isDirty: true,
    })

    const event = new Event('beforeunload', {
      cancelable: true,
    })

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)

    preventDefaultSpy.mockRestore()
    wrapper.unmount()
  })

  it('removes the beforeunload listener when the component unmounts', () => {
    const wrapper = createWrapper({
      isDirty: true,
    })

    wrapper.unmount()

    const event = new Event('beforeunload', {
      cancelable: true,
    })

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)

    preventDefaultSpy.mockRestore()
  })
})
