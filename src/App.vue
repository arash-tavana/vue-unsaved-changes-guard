<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard.ts'

const initialName = ref('Arash')
const name = ref(initialName.value)

const isDirty = computed(() => initialName.value !== name.value)

const saveInput = () => {
  initialName.value = name.value
}

useUnsavedChangesGuard({
  isDirty,
  message: 'تغییرات شما ذخیره نشده است. خارج می‌شوید؟',
})
</script>

<template>
  <RouterLink to="/about">Go to about</RouterLink>
  <p>{{ isDirty ? 'Dirty' : 'Clean' }}</p>
  <input v-model="name" type="text" />
  <button @click="saveInput">
    <span>Save</span>
  </button>
</template>

<style scoped></style>
