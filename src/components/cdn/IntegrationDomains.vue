<template>
  <div class="flex flex-col space-y-4">
    <CdnDomains
      ref="cdnDomains"
      :liveDomains=liveDomains
      @update-domains=onUpdateDomains
    >
      <template v-slot:buttons>
        <div>
          <div v-if="!workingDomains.length" class="errorMessage">
            <span class="errorMessage__text">Must have at least one domain</span>
          </div>
          <div class="save__buttons">
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
          <div class="w-full mt-2 flex justify-end">
            <HttpError :error=httpError />
          </div>
        </div>
      </template>
    </CdnDomains>
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import CdnDomains from '@/components/cdn/CdnDomains'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationDomains',
  props: ['integration'],
  components: {
    CdnDomains,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      httpError: null,
      isSaving: false,
      workingDomains: [
        {
          name: this.integration.data.domain,
          primary: true
        },
        ...this.integration.data.additionalDomains.map(domain => ({ name: domain }))
      ]
    }
  },
  computed: {
    ...mapState(['session']),
    canSaveChanges() {
      return this.hasChanges && this.workingDomains.length
    },
    hasChanges() {
      return !_.isEqual(this.liveDomains, this.workingDomains)
    },
    liveDomains() {
      return [
        {
          name: this.integration.data.domain,
          primary: true
        },
        ...this.integration.data.additionalDomains.map(domain => ({ name: domain }))
      ]
    }
  },
  methods: {
    onUpdateDomains(domains) {
      this.workingDomains = domains
    },
    resetChanges() {
      this.httpError = null
      this.$refs.cdnDomains.resetDomains()
    },
    async saveChanges() {
      const updatedIntegration = { ...this.integration }
      const domain = this.workingDomains.find(domain => domain.primary)
      updatedIntegration.data.domain = domain && domain.name
      // eslint-disable-next-line max-len
      updatedIntegration.data.additionalDomains = this.workingDomains.filter(domain =>  !domain.primary).map(domain => domain.name)
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
        this.httpError = error
      }
      setTimeout(() => {
        this.isSaving = false
      }, 800)
    }
  },
  mounted() {
    this.workingDomains =  [
      {
        name: this.integration.data.domain,
        primary: true
      },
      ...this.integration.data.additionalDomains.map(domain => ({ name: domain }))
    ]
  }
}
</script>

<style scoped>
.save__buttons {
  @apply flex space-x-2 justify-end mt-4;
}

@media (max-width: 550px) {
  .save__buttons {
    @apply w-full;
  }
  .save__buttons .button {
    @apply w-full
  }
}

@media (max-width: 400px) {
  .save__buttons {
    @apply flex-col space-x-0 space-y-2;
  }
}
</style>
