<template>
  <div class="my-2 flex flex-col text-gray-500">
    <div class="flex items-center mb-2">
      <div><BadgeCheckIcon class="h-5 mr-1 text-green" /></div>
      <span>Recovery email is enabled.</span>
    </div>
    <span class="mb-4">To remove your recovery email, please click the button below:</span>
    <button
      class="button button--error w-52 mb-1"
      @click=toggleConfirmationModal
    >
      <div v-if="isLoading" class="flex items-center">
        <span>Disabling</span>
        <span class="ml-2"><LoadingSpinner /></span>
      </div>
      <span v-else>Disable Recovery Eamil</span>
    </button>
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

import * as utils from '../../account-utils/index'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import DisableRecoveryConfirmation from '@/components/confirmations/DisableRecoveryConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
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
    ...mapState(['session'])
  },
  methods: {
    ...mapActions(['updateAccount']),
    async disableRecovery() {
      this.httpError = ''
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        await utils.accounts.disableRecovery(
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
