<template>
  <div class="my-2 flex flex-col text-gray-500 space-y-2">
    <span class="text-lg">PLACEHOLDER</span>
    <span>Your recovery email is xxx@xxx.xxx.</span>
    <span>You can remove it at any time with the button below</span>
    <button
      class="button button--error w-52"
      @click=toggleConfirmationModal
    >
      <div v-if="isLoading" class="flex items-center">
        <span>Disabling</span>
        <span><LoadingSpinner /></span>
      </div>
      <span v-else>Disable Recovery Eamil</span>
    </button>
    <!-- disable recovery email confirmation modal -->
    <DisableRecoveryConfirmation
      v-show=showConfirmationModal
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
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
    DisableRecoveryConfirmation,
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
    async disableRecovery() {
      this.loading = true
      try {
        this.toggleConfirmationModal()
        await utils.accounts.disableRecovery(
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
</style>
