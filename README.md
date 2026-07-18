# vue-unsaved-changes-guard

A small Vue 3 composable that warns users before leaving a page with unsaved changes.

It supports both browser refresh/close events and Vue Router navigation.

## Installation

```bash
npm install vue-unsaved-changes-guard
```

## Requirements

- Vue 3.5+
- Vue Router 5+

## Usage

```ts
import { ref } from 'vue'
import { useUnsavedChangesGuard } from 'vue-unsaved-changes-guard'

const isDirty = ref(false)

useUnsavedChangesGuard({
  isDirty,
})
```

## Options

```ts
useUnsavedChangesGuard({
  isDirty,
  message,
  confirmLeave,
})
```

| Option         | Type                                | Required | Description                                  |
|----------------|-------------------------------------|----------|----------------------------------------------|
| `isDirty`      | `Ref<boolean>`                      | ✅        | Indicates whether there are unsaved changes. |
| `message`      | `string`                            | ❌        | Custom confirmation message.                 |
| `confirmLeave` | `() => boolean \| Promise<boolean>` | ❌        | Custom confirmation handler.                 |

## Default behavior

If `confirmLeave` is not provided, the browser confirmation dialog is used.

```ts
useUnsavedChangesGuard({
  isDirty,
})
```

## Custom confirmation

```ts
useUnsavedChangesGuard({
  isDirty,
  confirmLeave: async () => {
    return await showConfirmationModal()
  },
})
```

## API

The composable returns a single function.

```ts
const { canLeave } = useUnsavedChangesGuard(...)
```

| Property   | Type                     |
|------------|--------------------------|
| `canLeave` | `() => Promise<boolean>` |

## License

MIT
