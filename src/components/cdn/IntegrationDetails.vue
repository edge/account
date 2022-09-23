<template>
  <CdnDetails
    ref="cdnDetails"
    :initialDisplayName=liveDisplayName
    :initialOriginUrl=liveOriginUrl
    @update-details=onUpdateDetails
  >
    <template v-slot:buttons>
      <div class="flex space-x-2 justify-end mt-4">
        <button
          @click=resetChanges
          :disabled=isSaving
          class="button button--outline button--small"
        >
          Cancel
        </button>
        <button
          @click=saveChanges
          :disabled="!canSaveChanges || isSaving"
          class="button button--success button--small"
        >
          <div v-if="isSaving" class="flex items-center">
            <span>Saving</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </template>
  </CdnDetails>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import CdnDetails from '@/components/cdn/CdnDetails'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationDetails',
  props: ['integration'],
  components: {
    CdnDetails,
    LoadingSpinner
  },
  data() {
    return {
      isSaving: false,
      workingDisplayName: '',
      workingOriginUrl: ''
    }
  },
  computed: {
    ...mapState(['session']),
    canSaveChanges() {
      return this.hasChanges && this.workingDisplayName && this.workingOriginUrl
    },
    hasChanges() {
      return this.liveDisplayName !== this.workingDisplayName || this.liveOriginUrl !== this.workingOriginUrl
    },
    liveDisplayName() {
      return this.integration.name
    },
    liveOriginUrl() {
      return this.integration.data.config.origin
    }
  },
  methods: {
    onUpdateDetails(newDisplayName, newOriginUrl) {
      this.workingDisplayName = newDisplayName
      this.workingOriginUrl = newOriginUrl
    },
    resetChanges() {
      this.$refs.cdnDetails.resetDetails()
    },
    async saveChanges() {
      const updatedIntegration = { ...this.integration }
      updatedIntegration.name = this.workingDisplayName
      updatedIntegration.data.config.origin = this.workingOriginUrl
      try {
        this.isSaving = true
        await utils.cdn.updateIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          updatedIntegration
        )
        this.$emit('refresh-integration')
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
      }
      setTimeout(() => {
        this.isSaving = false
      }, 800)
    }
  },
  mounted() {
    this.workingDisplayName = this.integration.name
    this.workingOriginUrl = this.integration.data.config.origin
  }
}
</script>

<style scoped>

</style>
