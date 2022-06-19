<template>
  <div class="flex flex-col text-gray-500">
    <div class="flex items-center mb-2">
      <div><BadgeCheckIcon class="h-5 mr-1 text-green" /></div>
      <span>Two-factor authentication is enabled.</span>
    </div>
    <span class="mb-4">To disable two-factor authentication, please click the button below:</span>
    <button
      class="button button--error sm:w-52"
      @click=toggleConfirmationModal
    >
      <div v-if="isLoading" class="flex items-center">
        <span>Disabling</span>
        <span class="ml-2"><LoadingSpinner /></span>
      </div>
      <span v-else>Disable 2FA</span>
    </button>
    <!-- error message  -->
    <HttpError :error=httpError />
    <!-- disable 2fa confirmation modal -->
    <Disable2FAConfirmation
      v-show=showConfirmationModal
      @modal-confirm=disable2FA
      @modal-close=toggleConfirmationModal
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import Disable2FAConfirmation from '@/components/confirmations/Disable2FAConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
    Disable2FAConfirmation,
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
    async disable2FA() {
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        await utils.accounts.disable2FA(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        await this.updateAccount()
        this.isLoading = false
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
.qrcode {
  @apply flex justify-center items-center mt-2;
}

@media (max-width: 400px) {
  /* split input and button into two rows */
  .input-field {
    @apply flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2;
  }

  .input-field .button {
    @apply w-full rounded-l-md;
  }

  .qrcode {
    @apply justify-start items-start;
  }
}
</style>
