<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Destroy {{ serverName }}</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: this cannot be undone.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>All data will be lost and cannot be recovered</li>
        <li>Server will be powered off immediately</li>
        <li>IP Address will be unassigned</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Destroy Server</template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'DestroyConfirmation',
  props: ['serverName'],
  components: {
    ExclamationIcon,
    Modal
  }
}
</script>

<style scoped>

</style>
