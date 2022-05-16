<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Destroy server and backups</h4>
      <p class="mt-3 mb-1 text-gray-500">This is irreversible. All server data and associated backups will be irretrievable.</p>
      <p class="text-gray-500">Upon destruction, you will no longer be billed for this server.</p>

      <button
        class="mt-5 button button--error"
        :disabled="isSaving || activeTask"
        @click.prevent="save"
      >
        <span v-if="isSaving">Destroying</span>
        <span v-else-if="activeTask">{{activeTask.status}}</span>
        <span v-else>Destroy this server and backups</span>
        <span v-if="isSaving || activeTask">
          <LoadingSpinner />
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { destroyHost } from '../../utils/api'

export default {
  name: 'Destroy',
  props: ['activeTask', 'server'],
  components: {
    LoadingSpinner
  },
  data: function () {
    return {
      isSaving: false,
      polling: null
    }
  },
  methods: {
    async save() {
      this.isSaving = true

      await destroyHost(this.server.serverId)

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          // this.$router.push('/')
          this.isSaving = false
        }
      }, 5000)
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
