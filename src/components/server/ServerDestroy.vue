<template>
  <div class="pb-20">
    <div class="box">
      <h4>Destroy server and backups</h4>
      <!-- server has already been deleted -->
      <div v-if="isDestroyed">
        <p class="mt-3 mb-1 text-gray-500">Your server and backups have been successfully deleted.</p>
        <router-link
          class="button button--success button--small w-full md:max-w-xs"
          :to="{ name: 'Servers' }"
        >
          <span>Return to Servers</span>
        </router-link>
      </div>

      <!-- server not yet deleted -->
      <div v-else>
        <!-- eslint-disable-next-line max-len -->
        <p class="mt-3 mb-1 text-gray-500">This is irreversible. All server data and associated backups will be irretrievable.</p>
        <p class="text-gray-500">Upon destruction, you will no longer be billed for this server.</p>
        <div class="flex flex-col space-y-2">
          <button
            class="mt-4 button button--error button--small w-full md:max-w-xs"
            :disabled="isLoading || disableActions"
            @click.prevent="toggleConfirmationModal"
          >
            <div v-if=isLoading class="flex">
              <span>Destroying</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Destroy this server and backups</span>
          </button>
          <HttpError :error=httpError />
        </div>
      </div>
    </div>
    <!-- destroy confirmation modal -->
    <DestroyServerConfirmation
      v-if=showConfirmationModal
      ref="destroyConfirmation"
      @modal-confirm=destroyServer
      @modal-close=toggleConfirmationModal
      :serverName="server.settings.name || server.settings.hostname"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import DestroyServerConfirmation from '@/components/confirmations/DestroyServerConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'ServerDestroy',
  props: ['disableActions', 'server'],
  data() {
    return {
      httpError: '',
      isLoading: false,
      showConfirmationModal: false
    }
  },
  components: {
    DestroyServerConfirmation,
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
    }
  },
  methods: {
    async destroyServer() {
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        const response = await api.servers.deleteServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        if (response.task) this.$store.commit('addTask', response.task)
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
</style>
