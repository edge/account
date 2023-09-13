<template>
  <div class="pb-20">
    <div class="box domain_delete">
      <h4>Delete storage and files</h4>
      <!-- deployment not yet deleted -->
      <div>
        <p class="mt-3 mb-1 text-gray-500">This is irreversible. The storage deployment and associated files will be deleted.</p>
        <p class="text-gray-500">Upon deletion, you will no longer be billed for this storage deployment.</p>
        <div class="flex flex-col space-y-2">
          <button
            class="button button--error button--small w-full md:max-w-xs"
            :disabled="isDeleting"
            @click.prevent="toggleConfirmationModal"
          >
            <div v-if=isDeleting class="flex">
              <span>Deleting</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Delete storage and files</span>
          </button>
          <HttpError :error=httpError />
        </div>
      </div>
    </div>
    <!-- delete confirmation modal -->
    <StorageIntegrationDestroyConfirmation
      v-if="showConfirmationModal"
      @modal-confirm="deleteIntegration"
      @modal-close="toggleConfirmationModal"
      :integrationName="integration.name"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StorageIntegrationDestroyConfirmation from '@/components/confirmations/StorageIntegrationDestroyConfirmation'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationDestroy',
  props: ['integration'],
  data() {
    return {
      httpError: '',
      isDeleting: false,
      showConfirmationModal: false
    }
  },
  components: {
    HttpError,
    LoadingSpinner,
    StorageIntegrationDestroyConfirmation
  },
  computed: {
    ...mapState(['session'])
  },
  methods: {
    async deleteIntegration() {
      this.isDeleting = true
      try {
        this.toggleConfirmationModal()
        await api.storage.deleteIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key
        )
        setTimeout(() => {
          this.isDeleting = false
          this.$emit('delete-integration')
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isDeleting = false
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
