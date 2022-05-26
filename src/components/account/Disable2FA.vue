<template>
  <div class="my-2 flex flex-col text-gray-500 space-y-2">
    <span>Two-factor authentication has been enabled for this account.</span>
    <span>You can remove it at any time with the button below</span>
    <button
      class="button button--success w-52"
      @click=toggleConfirmationModal
    >
      <div v-if="isLoading" class="flex items-center">
        <span>Disabling 2FA</span>
        <span><LoadingSpinner /></span>
      </div>
      <span v-else>Disable 2FA</span>
    </button>
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
import Disable2FAConfirmation from '@/components/confirmations/Disable2FAConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    Disable2FAConfirmation,
    LoadingSpinner
  },
  data() {
    return {
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
      this.loading = true
      try {
        this.toggleConfirmationModal()
        await utils.accounts.disable2FA(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        await this.updateAccount()
      }
      catch (error) {
        console.error(error)
      }
      this.loading = false
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
