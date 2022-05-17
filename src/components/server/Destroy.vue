<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <!-- server has been deleted -->
      <h4>Destroy server and backups</h4>
      <div v-if="isDeleted">
        <p class="mt-3 mb-1 text-gray-500">Your server and backups have been successfully deleted.</p>
        <button
          class="mt-5 button button--success"
          @click.prevent="returnToServers"
        >
          <span>Return to Servers</span>
        </button>
      </div>

      <!-- server not yet deleted -->
      <div v-else>
        <!-- eslint-disable-next-line max-len -->
        <p class="mt-3 mb-1 text-gray-500">This is irreversible. All server data and associated backups will be irretrievable.</p>
        <p class="text-gray-500">Upon destruction, you will no longer be billed for this server.</p>
        <button
          class="mt-5 button button--error"
          :disabled="isDeleting || activeTask"
          @click.prevent="deleteServer"
        >
          <span v-if="isDeleting">Destroying</span>
          <span v-else-if="activeTask">{{ activeTask.status }}</span>
          <span v-else>Destroy this server and backups</span>
          <span v-if="isDeleting || activeTask">
            <LoadingSpinner />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'

export default {
  name: 'Destroy',
  props: ['activeTask', 'onDeleteServer', 'server'],
  components: {
    LoadingSpinner
  },
  computed: {
    isDeleted() {
      return this.server.status === 'deleted'
    },
    isDeleting() {
      return this.server.status === 'deleting'
    }
  },
  methods: {
    async deleteServer() {
      await this.onDeleteServer()
    },
    returnToServers() {
      this.$router.push({ name: 'Servers' })
    }
  },
  watch: {
    activeTask(value) {
      if (value === null) {
        clearInterval(this.polling)
        this.polling = null
      }
    }
  }
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full p-4 md:p-6;
  }
</style>
