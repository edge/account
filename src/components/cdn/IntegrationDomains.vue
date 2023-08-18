<template>
  <div class="space-y-4">
    <CdnDomains
      ref="cdnDomains"
      :liveDomains=liveDomains
      :disableControls=disableControls
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
      <span>In order for Edge CDN to work for the specified domains, you will need to configure the DNS records appropriately. Please ensure each domain added correctly points to <span class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</span>:</span>
      <div class="overflow-x-auto">
        <table class="my-4 space-y-2">
          <tr>
            <th class="domain">Hostname</th>
            <th class="type">Type</th>
            <th>Value</th>
            <th class="ttl">TTL</th>
            <th></th>
          </tr>
          <tr v-for="(record, index) in dnsRecords" :key="record.domain">
            <td class="domain monospace" :title="`${ record.domain }`">
              {{ record.domain }}
            </td>
            <td class="type monospace">{{ record.zone && record.domain === record.zone ? 'ALIAS' : 'CNAME' }}</td>
            <td class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</td>
            <td class="ttl monospace">3600</td>
            <td class="action">
              <Tooltip v-if="!record.zone"
                position="left"
                text="DNS not managed by Edge"
              >
                <button
                  :disabled="true"
                  class="button button--success button--extraSmall"
                >
                  <span>Create record</span>
                </button>
              </Tooltip>
              <Tooltip v-else-if="record.recordExists"
                position="left"
                text="DNS record already exists"
              >
                <button
                  :disabled="true"
                  class="button button--success button--extraSmall"
                >
                  <span>Create record</span>
                </button>
              </Tooltip>
              <button
                v-else
                @click="createDnsRecord(index)"
                :disabled="record.creating"
                class="button button--success button--extraSmall"
              >
                <div v-if="record.creating" class="flex space-2">
                  <span>Creating</span>
                  <LoadingSpinner />
                </div>
                <span v-else>Create record</span>
              </button>
            </td>
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
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Tooltip from '@/components/Tooltip'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationDomains',
  props: ['disableControls', 'integration'],
  components: {
    CdnDomains,
    HttpError,
    LoadingSpinner,
    Tooltip
  },
  data() {
    return {
      dnsRecords: [],
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
    async createDnsRecord(index) {
      const recordToCreate = this.dnsRecords[index]
      try {
        recordToCreate.creating = true
        this.dnsRecords.splice(index, 1, recordToCreate)
        const isApex = recordToCreate.domain === recordToCreate.zone
        const subDomain = recordToCreate.domain.replace('.' + recordToCreate.zone, '')

        const { record } = await api.dns.createRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          recordToCreate.zone,
          {
            name: isApex ? '@' : subDomain,
            ttl: 3600,
            type: isApex ? 'ALIAS' : 'CNAME',
            value: `gateway.${this.isTestnet ? 'test' : 'edge'}.network.`
          }
        )

        await new Promise(resolve => setTimeout(resolve, 500))
        if (record) recordToCreate.recordExists = true
        recordToCreate.creating = false
        this.dnsRecords.splice(index, 1, recordToCreate)
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
        recordToCreate.creating = false
        this.dnsRecords.splice(index, 1, recordToCreate)

      }
    },
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
        this.updateDnsRecords()
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
        this.httpError = error
      }
      setTimeout(() => {
        this.isSaving = false
      }, 800)
    },
    async updateDnsRecords() {
      const { records } = await api.integration.checkDnsRecords(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.integration._key
      )
      this.dnsRecords = records
    }
  },
  mounted() {
    this.workingDomains =  [
      {
        name: this.integration.data.domain,
        primary: true
      },
      ...this.integration.data.additionalDomains.map(domain => ({ name: domain }))
    ],
    this.updateDnsRecords()
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
