<script setup>
// import HttpError from '../../../components/HttpError.vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import Modal from '../../../components/Modal.vue'
import { defineEmits, defineProps, ref } from 'vue'

const emit = defineEmits(['destroy'])

defineProps({
  busy: Boolean,
  disabled: Boolean,
  gpu: Object
})

const showModal = ref(false)

function toggleModal() {
  showModal.value = !showModal.value
}
</script>

<template>
  <div class="pb-20">
    <div class="box">
      <h4>Destroy GPU</h4>
      <p class="mt-3 mb-1 text-gray-500">This is irreversible. All data will be irretrievable.</p>
      <p class="text-gray-500">Upon destruction, you will no longer be billed for this GPU.</p>
      <div class="flex flex-col space-y-2">
        <button
          class="mt-4 button button--error button--small w-full md:max-w-xs"
          :disabled="disabled"
          @click.prevent="toggleModal"
        >
          <div v-if="busy" class="flex">
            <span>Destroying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Destroy this GPU</span>
        </button>

        <!--<HttpError :error=httpError />-->
      </div>
    </div>
    <!-- destroy confirmation modal -->
    <Modal v-if="showModal">
      <template v-slot:icon>
        <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
      </template>
      <template v-slot:header>
        <span>Destroy {{ gpu.name }}</span>
      </template>
      <template v-slot:body>
        <span class="font-semibold">Warning: this cannot be undone.</span>
        <div class="flex flex-col space-y-2 pt-4">
          <li>All data will be lost and cannot be recovered</li>
          <li>Server will be powered off immediately</li>
          <li>IP Address will be unassigned</li>
        </div>
      </template>
      <template v-slot:buttons>
        <button
          class="w-full mt-3 button button--small button--outline sm:mt-0"
          @click="toggleModal"
        >
          Cancel
        </button>
        <button
          class="w-full button button--small button--error"
          @click="emit('destroy')"
        >
          Yes, Destroy GPU
        </button>
      </template>
    </Modal>
  </div>
</template>
