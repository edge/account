<template>
  <div class="pb-20">
    <div class="box">
      <h4>Destroy CDN deployment</h4>
      <div>
        <p class="mt-3 mb-1 text-gray-500">This is irreversible. All deployment data will be irretrievable.</p>
        <p class="text-gray-500">Upon destruction, you will no longer be billed for this deployment.</p>
        <div class="flex flex-col space-y-2">
          <button
            class="button button--error button--small w-full md:max-w-xs"
            :disabled="isLoading"
            @click.prevent="toggleConfirmationModal"
          >
            <div v-if=isLoading class="flex">
              <span>Destroying</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Destroy this CDN deployment</span>
          </button>
          <HttpError :error=httpError />
        </div>
      </div>
    </div>
    <!-- destroy confirmation modal -->
    <IntegrationDestroyConfirmation
      v-if=showConfirmationModal
      @modal-confirm=destroyIntegration
      @modal-close=toggleConfirmationModal
      :integrationName="integration.name"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import HttpError from '@/components/HttpError'
import IntegrationDestroyConfirmation from '@/components/confirmations/IntegrationDestroyConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationDestroy',
  props: ['integration'],
  data() {
    return {
      httpError: '',
      isLoading: false,
      showConfirmationModal: false
    }
  },
  components: {
    IntegrationDestroyConfirmation,
    HttpError,
    LoadingSpinner
  },
  computed: {
    ...mapState(['session']),
    isDestroyed() {
      return this.integration.status === 'deleted'
    }
  },
  methods: {
    async destroyIntegration() {
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        setTimeout(async () => {
          await utils.cdn.deleteIntegration(
            process.env.VUE_APP_ACCOUNT_API_URL,
            this.session._key,
            this.integration._key
          )
          this.$emit('confirm-delete')
          this.isLoading = false
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isLoading = false
        }, 800)
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
