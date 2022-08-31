<template>
  <div class="pb-20">
    <div class="box">
      <h4>Delete domain and records</h4>
      <!-- server not yet deleted -->
      <div>
        <!-- eslint-disable-next-line max-len -->
        <p class="mt-3 mb-1 text-gray-500">This is irreversible. The domain and associated records will be deleted.</p>
        <p class="text-gray-500">Upon deletion, you will no longer be billed for this domain.</p>
        <div class="flex flex-col space-y-2">
          <button
            class="button button--error w-full md:max-w-xs"
            :disabled="isDeleting"
            @click.prevent="toggleConfirmationModal"
          >
            <div v-if=isDeleting class="flex">
              <span>Deleting</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Delete domain and records</span>
          </button>
          <HttpError :error=httpError />
        </div>
      </div>
    </div>
    <!-- delete confirmation modal -->
    <DeleteDomainConfirmation
      v-if=showConfirmationModal
      @modal-confirm=deleteDomain
      @modal-close=toggleConfirmationModal
      :domainName="domain._key"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import DeleteDomainConfirmation from '@/components/confirmations/DeleteDomainConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'DomainDelete',
  props: ['domain'],
  data() {
    return {
      httpError: '',
      isDeleting: false,
      showConfirmationModal: false
    }
  },
  components: {
    DeleteDomainConfirmation,
    HttpError,
    LoadingSpinner
  },
  computed: {
    ...mapState(['session'])
  },
  methods: {
    async deleteDomain() {
      this.isDeleting = true
      try {
        this.toggleConfirmationModal()
        await utils.dns.deleteZone(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.domain._key
        )
        setTimeout(() => {
          this.isDeleting = false
          this.$emit('delete-domain')
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
  .box {
    @apply bg-white rounded-lg w-full p-4 md:p-6;
  }
</style>
