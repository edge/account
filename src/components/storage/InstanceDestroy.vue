<template>
  <div class="pb-20">
    <div class="box domain_delete">
      <h4>Delete storage and files</h4>
      <!-- instance not yet deleted -->
      <div>
        <p class="mt-3 mb-1 text-gray-500">This is irreversible. The storage instance and associated files will be deleted.</p>
        <p class="text-gray-500">Upon deletion, you will no longer be billed for this storage instance.</p>
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
    <DeleteDomainConfirmation
      v-if="showConfirmationModal"
      @modal-confirm="deleteInstance"
      @modal-close="toggleConfirmationModal"
      :domainName="domain._key"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import DeleteDomainConfirmation from '@/components/confirmations/DeleteDomainConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'InstanceDelete',
  props: ['instance'],
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
    async deleteInstance() {
      this.isDeleting = true
      try {
        this.toggleConfirmationModal()
        // @TODO
        await api.storage.deleteInstance(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance._key
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
</style>
