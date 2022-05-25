<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Resize {{ serverName }}</span>
    </template>
    <template v-slot:body>
     <span class="font-semibold">Warning: server will be powered off while resizing.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <!-- eslint-disable-next-line max-len -->
        <li>Cost will {{ costIncreased ? 'increase' : 'decrease' }} from {{ currentCostFormatted }} to {{ newCostFormatted }}</li>
        <li v-if="diskIncreased">Disk space cannot be reduced after resize</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Resize Server</template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'ResizeConfirmation',
  props: ['currentCost', 'currentSpec', 'newCost', 'newSpec', 'serverName'],
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
    }
  },
  methods: {
    formatCost(cost) {
      return (Math.ceil(cost * 100) / 100).toFixed(2)
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
