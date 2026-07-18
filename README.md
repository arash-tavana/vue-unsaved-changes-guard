# vue-unsaved-changes-guard

[![CI](https://github.com/arash-tavana/vue-unsaved-changes-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/arash-tavana/vue-unsaved-changes-guard/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vue-unsaved-changes-guard.svg)](https://www.npmjs.com/package/vue-unsaved-changes-guard)
[![license](https://img.shields.io/npm/l/vue-unsaved-changes-guard.svg)](./LICENSE)

A lightweight Vue 3 composable for preventing users from accidentally leaving a page with unsaved changes.

It handles both:

- browser refresh, tab close, and page unload
- navigation between routes with Vue Router

You can use the browser's default confirmation dialog or provide your own synchronous or asynchronous confirmation
handler.

## Features

- Prevents accidental navigation when there are unsaved changes
- Supports Vue Router navigation
- Handles browser refresh, tab close, and page unload
- Supports custom synchronous and asynchronous confirmation handlers
- Fully typed with TypeScript

## Installation

```bash
npm install vue-unsaved-changes-guard
```

## Requirements

- Vue 3.5 or later
- Vue Router 4 or later

## Usage

```ts
import { ref } from 'vue'
import { useUnsavedChangesGuard } from 'vue-unsaved-changes-guard'

const isDirty = ref(false)

useUnsavedChangesGuard({ isDirty })

function onInput() {
  isDirty.value = true
}

async function saveForm() {
  // Save data...

  isDirty.value = false
}
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

The composable returns the following API:

| Property   | Type                     | Description                                                          |
|------------|--------------------------|----------------------------------------------------------------------|
| `canLeave` | `() => Promise<boolean>` | Resolves to `true` when navigation is allowed and `false` otherwise. |

## Browser behavior

When users refresh the page, close the browser tab, or leave the site, modern browsers ignore custom messages shown by
`beforeunload`.

In these cases, the browser displays its own confirmation dialog.

This is a browser security restriction and cannot be overridden by this library.

## Limitations

- The `beforeunload` event always uses the browser's native confirmation dialog.
- Custom confirmation handlers are only used for Vue Router navigation.

## Contributing

Contributions, issues, and feature requests are welcome.

## License

This project is licensed under the MIT License.
