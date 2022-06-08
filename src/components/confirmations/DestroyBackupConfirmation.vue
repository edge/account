<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Delete backup: {{ backup.comment }}</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: this cannot be undone.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>All backup data will be lost and cannot be recovered</li>
        <li>This action will not affect current server status</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Delete Backup</template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'DestroyBackupConfirmation',
  props: ['backup'],
  components: {
    ExclamationIcon,
    Modal
  }
}
</script>

<style scoped>

</style>
