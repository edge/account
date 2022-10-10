<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Resize {{ serverName }}</span>
    </template>
    <template v-slot:body>
     <div class="flex flex-col space-y-2">
       <span class="font-semibold">Warning: server will be powered off while resizing.</span>
     </div>
      <div class="flex flex-col space-y-2 pt-4">
        <!-- eslint-disable-next-line max-len -->
        <li v-if="resizedInLastHour">Your server was resized less than one hour ago. If you continue to resize again, you'll be charged a full hour for the previous size</li>
        <!-- eslint-disable-next-line max-len -->
        <li>Cost will {{ costIncreased ? 'increase' : 'decrease' }} from {{ currentCostFormatted }} to {{ newCostFormatted }}</li>
        <li v-if="diskIncreased">Disk space cannot be reduced after resize</li>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full button button--small button--error"
        @click="confirm"
      >
        Yes, Resize Server
      </button>
      <button
        class="w-full mt-3 button button--small button--outline sm:mt-0"
        @click="close"
      >
        Cancel
      </button>
    </template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'ResizeServerConfirmation',
  props: [
    'currentCost',
    'currentSpec',
    'lastResizeTask',
    'newCost',
    'newSpec',
    'serverName'
  ],
  components: {
    ExclamationIcon,
    Modal
  },
  computed: {
    costIncreased() {
      return this.newCost > this.currentCost
    },
    currentCostFormatted() {
      return `$${this.formatCost(this.currentCost)} per hour`
    },
    diskIncreased() {
      return this.currentSpec.disk < this.newSpec.disk
    },
    newCostFormatted() {
      return `$${this.formatCost(this.newCost)} per hour`
    },
    resizedInLastHour() {
      const oneHourAgo = Date.now() - 3.6e6
      return this.lastResizeTask && this.lastResizeTask.updated > oneHourAgo
    }
  },
  methods: {
    formatCost(cost) {
      return (Math.ceil(cost * 1e4) / 1e4).toFixed(4)
    },
    close() {
      this.$emit('modal-close')
    },
    confirm() {
      this.$emit('modal-confirm')
    }
  }
}
</script>

<style scoped>
.specs {
  @apply text-red;
}

.current {
  @apply text-red;
}

.new {
  @apply text-black;
}
</style>
