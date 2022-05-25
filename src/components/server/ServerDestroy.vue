<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Destroy server and backups</h4>
      <!-- server has already been deleted -->
      <div v-if="isDestroyed">
        <p class="mt-3 mb-1 text-gray-500">Your server and backups have been successfully deleted.</p>
        <button
          class="button button--success"
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
          class="button button--error"
          :disabled="isLoading"
          @click.prevent="toggleDestroyConfirmation"
        >
          <div v-if=isLoading class="flex">
            <span>Destroying</span>
            <span><LoadingSpinner /></span>
          </div>
          <span v-else>Destroy this server and backups</span>
        </button>
      </div>
    </div>
    <!-- destroy confirmation modal -->
    <DestroyConfirmation
      v-show=showConfirmationModal
      ref="destroyConfirmation"
      @modal-confirm=destroyServer
      @modal-close=toggleDestroyConfirmation
      :serverName="server.settings.hostname"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import DestroyConfirmation from '@/components/confirmations/DestroyConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'ServerDestroy',
  props: ['activeTasks', 'server'],
  data() {
    return {
      isLoading: false,
      showConfirmationModal: false
    }
  },
  components: {
    DestroyConfirmation,
    LoadingSpinner
  },
  computed: {
    ...mapState(['session']),
    isDestroyed() {
      return this.server.status === 'deleted'
    },
    serverId() {
      return this.$route.params.id
    },
    isModalOpen() {
      return this.$refs.destroyConfirmation.open
    }
  },
  methods: {
    async destroyServer() {
      this.isLoading = true
      try {
        const response = await utils.servers.deleteServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.$store.commit('addTask', response.task)
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
      this.isLoading = false
    },
    toggleDestroyConfirmation() {
      this.showConfirmationModal = !this.showConfirmationModal
    }
  }
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full p-4 md:p-6;
  }
</style>
