<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Restore backup: {{ backup.comment }}</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: this cannot be undone.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>Server will be powered down temporarily</li>
        <li>You server and data will be restored to a previous state</li>
        <li>All data created since the backup will be lost</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Restore Backup</template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'RestoreBackupConfirmation',
  props: ['backup'],
  components: {
    ExclamationIcon,
    Modal
  }
}
</script>

<style scoped>

</style>
