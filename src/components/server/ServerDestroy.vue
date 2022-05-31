<template>
  <div class="pb-20">
    <div class="box">
      <h4>Destroy server and backups</h4>
      <!-- server has already been deleted -->
      <div v-if="isDestroyed">
        <p class="mt-3 mb-1 text-gray-500">Your server and backups have been successfully deleted.</p>
        <button
          class="button button--success w-full md:max-w-xs"
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
        <div class="flex flex-col space-y-2">
          <button
            class="button button--error w-full md:max-w-xs"
            :disabled="isLoading"
            @click.prevent="toggleConfirmationModal"
          >
            <div v-if=isLoading class="flex">
              <span>Destroying</span>
              <span><LoadingSpinner /></span>
            </div>
            <span v-else>Destroy this server and backups</span>
          </button>
          <HttpError :error=httpError />
        </div>
      </div>
    </div>
    <!-- destroy confirmation modal -->
    <DestroyConfirmation
      v-show=showConfirmationModal
      ref="destroyConfirmation"
      @modal-confirm=destroyServer
      @modal-close=toggleConfirmationModal
      :serverName="server.settings.hostname"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import DestroyConfirmation from '@/components/confirmations/DestroyConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'ServerDestroy',
  props: ['activeTasks', 'server'],
  data() {
    return {
      httpError: '',
      isLoading: false,
      showConfirmationModal: false
    }
  },
  components: {
    DestroyConfirmation,
    HttpError,
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
        this.toggleConfirmationModal()
        const response = await utils.servers.deleteServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.$store.commit('addTask', response.task)
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    toggleConfirmationModal() {
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
