<template>
  <ModalTest>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Destroy {{ serverName }}</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: this cannot be undone.</span>
      <div class="flex flex-col space-y-2 py-4">
        <li>All data will be lost and cannot be recovered</li>
        <li>Server will be powered off immediately</li>
        <li>IP Address will be unassigned</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Destroy Server</template>
  </ModalTest>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import ModalTest from '@/components/ModalTest'

export default {
  name: 'DestroyConfirmation',
  props: ['serverName'],
  components: {
    ExclamationIcon,
    ModalTest
  }
}
</script>

<style scoped>

</style>
