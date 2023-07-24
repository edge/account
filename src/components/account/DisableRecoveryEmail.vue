<template>
  <div class="my-2 flex flex-col text-gray-500">
    <p class="text-2xl text-green">{{ account.email.address }}</p>
    <div class="flex space-x-2">
      <button
        class="button button--outline-success w-52 mb-1"
        @click=toggleConfirmationModal
      >
        <div v-if="isLoading" class="flex items-center">
          <span>Changing</span>
          <span class="ml-2"><LoadingSpinner /></span>
        </div>
        <span v-else>Change Email</span>
      </button>
      <button
        class="button button--error w-52 mb-1"
        @click=toggleConfirmationModal
      >
        <div v-if="isLoading" class="flex items-center">
          <span>Removing</span>
          <span class="ml-2"><LoadingSpinner /></span>
        </div>
        <span v-else>Remove Email</span>
      </button>
    </div>
    <HttpError :error=httpError />
    <!-- disable recovery email confirmation modal -->
    <DisableRecoveryConfirmation
      v-if=showConfirmationModal
      @modal-confirm=disableRecovery
      @modal-close=toggleConfirmationModal
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import DisableRecoveryConfirmation from '@/components/confirmations/DisableRecoveryConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    DisableRecoveryConfirmation,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      httpError: '',
      isLoading: false,
      showConfirmationModal: false
    }
  },
  computed: {
    ...mapState(['account', 'session'])
  },
  methods: {
    ...mapActions(['updateAccount']),
    async disableRecovery() {
      this.httpError = ''
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        await api.accounts.disableRecovery(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        setTimeout(async () => {
          await this.updateAccount()
          this.isLoading = false
        }, 500)
      }
      catch (error) {
        setTimeout(async () => {
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
