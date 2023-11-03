<template>
  <div class="pb-20 flex flex-col space-y-4">
    <div class="box">
      <div>
        <h4>Storage API Key</h4>
        <p class="text-gray-500">Your unique API key facilitates secure access to Storage, allowing for script automation and direct uploads. Remember to keep it confidential to ensure the security of your data.</p>
      </div>
      <!-- account number display -->
      <div class="api-key-wrapper">
        <span v-if="showApiKey" class="api-key monospace">{{ apiKey }}</span>
        <span v-else class="api-key masked monospace">{{ maskedApiKey }}</span>
        <!-- hide/show account number button button -->
        <button
          @click.prevent="toggleShowApiKey"
          class="ml-2 text-gray-400 hover:text-green"
        >
          <EyeIcon v-if="showApiKey" class="ml-2 w-5 h-5" />
          <EyeOffIcon v-else class="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
    <div class="box">
      <h4>Regenerate API Key</h4>
      <div>
        <p class="text-gray-500">If you suspect that your API key has been compromised, or wish to reset it for any other reason, use this option to generate a new key. Your previous key will no longer work.</p>
        <div class="flex flex-col space-y-2">
          <button
            class="button button--error button--small w-full md:max-w-xs"
            :disabled="isRegenerating"
            @click.prevent="toggleShowConfirmationModal"
          >
            <div v-if=isRegenerating class="flex">
              <span>Regenerating</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Regenerate Key</span>
          </button>
          <HttpError :error=httpError />
        </div>
      </div>
    </div>
    <!-- delete confirmation modal -->
    <StorageRegenerateKeyConfirmation
      v-if="showConfirmationModal"
      @modal-confirm="regenerateApiKey"
      @modal-close="toggleShowConfirmationModal"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StorageRegenerateKeyConfirmation from '@/components/confirmations/StorageRegenerateKeyConfirmation'
import { mapState } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

export default {
  name: 'IntegrationApiKey',
  props: ['integration'],
  data() {
    return {
      httpError: '',
      isRegenerating: false,
      showApiKey: false,
      showConfirmationModal: false
    }
  },
  components: {
    EyeIcon,
    EyeOffIcon,
    HttpError,
    LoadingSpinner,
    StorageRegenerateKeyConfirmation
  },
  computed: {
    ...mapState(['session']),
    apiKey() {
      let apiKey = ''
      for (const key in this.integration.data.config.apiKeys) {
        if (this.integration.data.config.apiKeys[key].active) apiKey = key
      }
      return apiKey
    },
    maskedApiKey() {
      return this.apiKey.replaceAll(/[a-zA-Z0-9]/gi, 'x')
    }
  },
  methods: {
    async regenerateApiKey() {
      this.isRegenerating = true
      const updatedIntegration = { ...this.integration }
      const updatedApiKeys = {
        [uuidv4()]: { active: true }
      }
      updatedIntegration.data.config = {
        ...updatedIntegration.data.config,
        apiKeys: updatedApiKeys
      }
      try {
        this.toggleShowConfirmationModal()
        await api.integration.updateIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          updatedIntegration
        )
        setTimeout(() => {
          this.isRegenerating = false
          this.$emit('regenerate')
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isRegenerating = false
        }, 500)
      }
    },
    toggleShowConfirmationModal() {
      this.showConfirmationModal = !this.showConfirmationModal
    },
    toggleShowApiKey() {
      this.showApiKey = !this.showApiKey
    }
  }
}
</script>

<style scoped>
.api-key-wrapper {
  @apply flex items-center justify-between relative w-max max-w-full;
}
.api-key {
  @apply text-3xl text-green pr-4;
}
.api-key.masked {
  @apply text-gray;
}
</style>
