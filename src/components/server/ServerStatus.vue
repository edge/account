<template>
  <div
    class="flex items-center"
    :class="[
      isActive ? 'active' : '',
      isInactive ? 'inactive' : '',
      extraClass
    ]"
  >
    <span class="serverList__statusDot" />
    <span class="serverList__statusText capitalize">{{ status }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ServerStatus',
  props: ['extraClass', 'server'],
  computed: {
    ...mapState(['tasks']),
    activeTasks() {
      return this.$store.getters.tasksByServerId(this.server._key)
    },
    disablingTaskInProgress() {
      // server status and active tasks aren't always 100% in sync
      // these tasks are where the status will be displayed in grey whilst running
      return this.isStopping || this.isStarting || this.isResizing || this.isRestoring
    },
    isActive() {
      return (!this.disablingTaskInProgress) && this.server.status === 'active'
    },
    isDestroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    isInactive() {
      // eslint-disable-next-line max-len
      return (!this.disablingTaskInProgress) && (['deleted', 'deleting', 'stopped'].includes(this.server.status) || this.isDestroying)
    },
    isResizing() {
      return this.activeTasks.some(task => task.action === 'resizeResource')
    },
    isRestoring() {
      return this.activeTasks.some(task => task.action === 'restoreBackup')
    },
    isStarting() {
      return this.activeTasks.some(task => task.action === 'start')
    },
    isStopping() {
      return this.activeTasks.some(task => task.action === 'stop')
    },
    status() {
      if (this.isStopping) return 'Stopping'
      if (this.isDestroying) return 'Deleting'
      if (this.isResizing) return 'Resizing'
      if (this.isRestoring) return 'Restoring'
      if (this.isStarting) return 'Starting'
      return this.server.status
    }
  }
}
</script>

<style>
.text-m {
  font-size: 0.8rem;
}

/* status dot */
.serverList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.active .serverList__statusDot {
  @apply bg-green;
}
.inactive .serverList__statusDot {
  @apply bg-red;
}
.active .serverList__statusText {
  @apply text-green;
}
.inactive .serverList__statusText {
  @apply text-red;
}
</style>
