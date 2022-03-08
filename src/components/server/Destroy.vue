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
          <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <line x1="12" y1="6" x2="12" y2="3" />
            <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
            <line x1="18" y1="12" x2="21" y2="12" />
            <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
            <line x1="6" y1="12" x2="3" y2="12" />
            <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { destroyHost } from '../../utils/api'

export default {
  name: 'Destroy',
  props: ['activeTask', 'server'],
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
