<template>
  <div class="space-y-4">
    <div class="coming-soon">
      <div class="float-left">
        <InformationCircleIcon class="w-5 mr-1"/>
      </div>
      <span>Modifying domains will be available soon.</span>
    </div>
    <CdnDomains
      ref="cdnDomains"
      :liveDomains=liveDomains
      :disableControls="false"
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
              :disabled="!hasChanges || isSaving"
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
    <div class="box">
      <h4 class="mb-4">Configure DNS</h4>
      <!-- eslint-disable-next-line max-len -->
      <span>In order for Edge CDN to work for the specified domains, you will need to configure the DNS records appropriately. Please ensure each domain added correctly points to <span class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</span>:</span>
      <div class="overflow-x-auto">
        <table class="my-4 space-y-2">
          <tr>
            <th class="domain">Hostname</th>
            <th>Type</th>
            <th>Value</th>
            <th>TTL</th>
          </tr>
          <tr>
            <td class="domain monospace">{{ integration.data.domain }}</td>
            <td class="monospace">CNAME</td>
            <td class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</td>
            <td class="monospace">3600</td>
          </tr>
          <tr v-for="domain in integration.data.additionalDomains" :key=domain>
            <td class="domain monospace">{{ domain }}</td>
            <td class="monospace">CNAME</td>
            <td class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</td>
            <td class="monospace">3600</td>
          </tr>
        </table>
      </div>
      <span>If you require any assistance, please contact support@edge.network</span>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import CdnDomains from '@/components/cdn/CdnDomains'
import HttpError from '@/components/HttpError.vue'
import { InformationCircleIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationDomains',
  props: ['disableControls', 'integration'],
  components: {
    CdnDomains,
    HttpError,
    InformationCircleIcon,
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
    ...mapState(['isTestnet', 'session']),
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
        await api.integration.updateIntegration(
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
th {
  @apply font-normal text-left;
}
th, td {
  @apply pr-4
}
.domain {
  @apply truncate;
}

.coming-soon {
  @apply bg-gray-300 rounded-lg p-4;
}
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
