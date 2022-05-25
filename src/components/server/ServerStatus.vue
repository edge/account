<template>
  <div>
    <Switch
      @click="toggleServer"
      :class="enabled ? 'bg-green' : 'bg-gray-300'"
      class="switch"
      :disabled="toggling"
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
      v-show=showConfirmationModal
      ref="destroyConfirmation"
      @modal-confirm=stopServer
      @modal-close=toggleConfirmationModal
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StopConfirmation from '@/components/confirmations/StopConfirmation'
import { Switch } from '@headlessui/vue'
import { mapState } from 'vuex'

export default {
  name: 'ServerStatus',
  props: ['activeTasks', 'server'],
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
    ...mapState(['session']),
    enabled() {
      return this.stopping || this.server.status === 'active'
    },
    serverId() {
      return this.$route.params.id
    },
    starting() {
      return this.activeTasks.some(task => task.action === 'start')
    },
    stopping() {
      return this.activeTasks.some(task => task.action === 'stop')
    },
    toggling() {
      return this.starting || this.stopping
    }
  },
  methods: {
    async startServer() {
      const response = await utils.servers.startServer(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      this.$store.commit('addTask', response.task)
    },
    async stopServer() {
      const response = await utils.servers.stopServer(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      this.$store.commit('addTask', response.task)
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
