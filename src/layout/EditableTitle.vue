<script setup>
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import { CheckIcon, PencilIcon, XIcon } from '@heroicons/vue/outline'
import { defineEmits, defineModel, defineProps, ref, watchPostEffect } from 'vue'

const emit = defineEmits(['cancel', 'edit','save'])

const props = defineProps({
  busy: Boolean,
  disabled: Boolean,
  invalid: Boolean,
  placeholder: String
})

const editing = ref(false)
const input = ref(null)
const model = defineModel()
const previousValue = ref(model.value)

function cancel() {
  editing.value = false
  model.value = previousValue.value

  emit('cancel')
}

function edit() {
  editing.value = true

  emit('edit')
}

function save() {
  if (props.invalid) return

  editing.value = false
  previousValue.value = model.value

  emit('save')
}

watchPostEffect(() => {
  if (input.value) {
    input.value.focus()
  }
})
</script>

<template>
  <div v-if="editing" class="editable-title__container flex">
    <input
      v-model="model"
      @keypress.enter="save"
      class="editable-title__value"
      :placeholder="placeholder"
      ref="input"
      type="text"
    />

    <div class="mt-3 flex">
      <button class="ml-2" @click="save" :disabled="invalid || disabled">
        <CheckIcon class="button__icon text-green hover:text-green-600" />
      </button>
      <button @click="cancel" class="ml-2">
        <XIcon class="button__icon text-red hover:text-red-600" />
      </button>
    </div>
  </div>

  <div v-else class="editable-title__container flex">
    <h1 class="w-max mb-0">{{ model }}</h1>

    <div class="mt-3">
      <button v-if="busy" class="ml-2" disabled>
        <LoadingSpinner />
      </button>
      <button v-else class="ml-2" @click="edit" :disabled="disabled">
        <PencilIcon class="button__icon text-gray-400 hover:text-green" />
      </button>
    </div>
  </div>
</template>

<style>
.editable-title__value {
  @apply bg-transparent text-3xl text-gray-600 border-b border-gray-400 w-full;
  @apply focus:outline-none focus:border-green focus:text-green;
}

.editable-title__container .button__icon {
  @apply w-5 ml-1;
}

.editable-title__container button:disabled,
.editable-title__container button:disabled .button__icon {
  @apply text-gray-400 hover:no-underline;
}
</style>
