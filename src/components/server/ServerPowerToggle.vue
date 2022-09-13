<template>
  <div>
    <Switch
      @click="toggleServer"
      :class="enabled ? 'bg-green' : 'bg-gray-300'"
      class="switch"
      :disabled="toggling || disableActions || disablePowerOn"
    >
      <span class="sr-only">Use setting</span>
      <span
        class="label"
        :class="enabled ? 'justify-start text-white pl-3 md:pl-4' : 'justify-end text-gray-500 pr-2.5 md:pr-3.5'"
      >
        {{ toggling ? '' : enabled ? 'ON' : 'OFF' }}
        <LoadingSpinner v-if="toggling" />
      </span>
      <span
        aria-hidden="true"
        :class="enabled ? 'translate-x-9 md:translate-x-12' : 'translate-x-0'"
        class="transform ball"
      />
    </Switch>
    <!-- stop confirmation modal -->
    <StopConfirmation
      v-if=showConfirmationModal
      @modal-confirm=stopServer
      @modal-close=toggleConfirmationModal
      :serverName="server.settings.name || server.settings.hostname"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StopConfirmation from '@/components/confirmations/StopConfirmation'
import { Switch } from '@headlessui/vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerPowerToggle',
  props: ['activeTasks', 'disableActions', 'server'],
  data() {
    return {
      showConfirmationModal: false
    }
  },
  components: {
    LoadingSpinner,
    StopConfirmation,
    Switch
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['session']),
    destroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    disablePowerOn() {
      return !this.enabled && this.balanceSuspend
    },
    disablingTaskInProgress() {
      // server status and active tasks aren't always 100% in sync
      // these tasks are where the server is "off" whilst running
      return this.resizing || this.restoring || this.destroying
    },
    enabled() {
      return !this.disablingTaskInProgress && (this.stopping || this.server.status === 'active')
    },
    serverId() {
      return this.$route.params.id
    },
    resizing() {
      const diskResize = this.activeTasks.some(task => task.action === 'resizeDisk')
      const resourceResize = this.activeTasks.some(task => task.action === 'resizeResource')
      return diskResize || resourceResize
    },
    restoring() {
      return this.activeTasks.some(task => task.action === 'restoreBackup')
    },
    starting() {
      return this.activeTasks.some(task => task.action === 'start')
    },
    stopping() {
      return this.activeTasks.some(task => task.action === 'stop')
    },
    toggling() {
      return this.stopping || this.starting
    }
  },
  methods: {
    async startServer() {
      const { task } = await utils.servers.startServer(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      this.$store.commit('addTask', task)
    },
    async stopServer() {
      const { task } = await utils.servers.stopServer(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      this.$store.commit('addTask', task)
      this.toggleConfirmationModal()
    },
    toggleConfirmationModal() {
      this.showConfirmationModal = !this.showConfirmationModal
    },
    async toggleServer () {
      if (this.server.status === 'active') {
        this.toggleConfirmationModal()
      }
      else {
        await this.startServer()
      }
    }
  }
}
</script>

<style scoped>
  .switch {
    @apply relative inline-flex flex-shrink-0 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-16 md:w-20 h-7 md:h-8 focus:outline-none;
  }
  .ball {
    @apply inline-block w-6 h-6 md:w-7 md:h-7 transition duration-200 ease-in-out bg-white rounded-full shadow-lg pointer-events-none ring-0;
  }
  .label {
    @apply absolute w-full h-full flex items-center text-xs leading-none;
  }
</style>
