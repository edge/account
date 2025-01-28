<script setup>
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import ValidationError from '@/components/ValidationError.vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { CheckIcon, PencilIcon, XIcon } from '@heroicons/vue/outline'
import { computed, defineEmits, defineProps, reactive, ref, watchEffect } from 'vue'

const emit = defineEmits(['change'])

const props = defineProps({
  busy: Boolean,
  disabled: Boolean,
  placeholder: String,
  validation: [Function, Object],
  value: String
})

const formState = reactive({
  newValue: ''
})

const v$ = useVuelidate({ newValue: props.validation || { required } }, formState)

const canSave = computed(() => !props.disabled && !v$.value.$invalid)
const editing = ref(false)
const inputRef = ref(null)

function cancelEdit() {
  editing.value = false
  reset()
}

function reset() {
  v$.value.newValue.$model = props.value || ''
  v$.value.$reset()
}

function startEdit() {
  reset()
  editing.value = true
}

async function stopEdit() {
  if (!await v$.value.$validate()) {
    console.log(v$.value.$errors)
    return
  }

  emit('change', v$.value.newValue.$model)

  editing.value = false
}

watchEffect(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <div class="editable-title__container flex">
    <div v-if="editing">
      <input
        v-model="v$.newValue.$model"
        @keypress.enter="stopEdit"
        class="editable-title__value"
        :placeholder="placeholder"
        ref="inputRef"
        type="text"
      />
      <ValidationError :errors="v$.newValue.$errors" />
    </div>
    <h1 v-else class="w-max mb-0">{{ busy ? v$.newValue.$model : value }}</h1>

    <div class="mt-3">
      <button v-if="busy" class="ml-2" disabled>
        <LoadingSpinner />
      </button>
      <button v-else-if="editing" class="ml-2" @click="stopEdit" :disabled="!canSave">
        <CheckIcon class="button__icon text-green hover:text-green-600" />
      </button>
      <button v-else class="ml-2" @click="startEdit" :disabled="disabled">
        <PencilIcon class="button__icon text-gray-400 hover:text-green" />
      </button>

      <button v-if="!busy && editing" @click="cancelEdit" class="ml-2">
        <XIcon class="button__icon text-red hover:text-red-600" />
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
