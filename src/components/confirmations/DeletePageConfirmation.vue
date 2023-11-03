<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Delete page</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">This action cannot be undone.</span>
      <div class="flex flex-col space-y-2 py-4">
        <li>The page will stop working immediately.</li>
      </div>
      <span>Please confirm deletion of page <span class="monospace">{{ pageName }}</span></span>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full mt-3 button button--small button--outline sm:mt-0"
        @click="close"
      >
        Cancel
      </button>
      <button
        class="w-full button button--small button--error"
        @click="confirm"
      >
        Yes, Delete Page
      </button>
    </template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'DestroyPageConfirmation',
  props: ['pageName'],
  components: {
    ExclamationIcon,
    Modal
  },
  methods: {
    close() {
      this.$emit('modal-close')
    },
    confirm() {
      this.$emit('modal-confirm')
    }
  }
}
</script>
