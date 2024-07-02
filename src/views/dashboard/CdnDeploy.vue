<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge Content Delivery</h1>
    <div v-if="deployed" class="space-y-4">
      <div class="box md:text-center">
        <h4 class="text-green text-2xl">Success</h4>
        <div class="max-w-xl m-auto">
          <span>CDN has been successfully deployed to the network.</span>
          <br/>
          <span class="block mt-2">In order to become operational, DNS records must be created for each domain added.</span>
        </div>
      </div>
      <div class="box">
        <h4>DNS Settings</h4>
        <div class="flex flex-col space-y-4 overflow-x-visible">
          <span>Please create the following DNS records to enabled CDN to work:</span>
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
          <span>You can set these up later, but CDN won't become operational until you do.</span>
          <span>Changes can take up to 24 hours. If you require any assistance, please contact support@edge.network</span>
          <button
            @click=continueToIntegration
            class="button button--small button--success w-full md:max-w-xs"
          >
            Continue
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col space-y-4">
      <DeploymentWarning v-if="balanceSuspend || balanceWarning" />
      <!-- details -->
      <CdnDisplayName @update-details=onUpdateDetails :disableControls=disableControls />
      <CdnDomains @update-domains=onUpdateDomains :disableControls=disableControls />
      <CdnConfig @update-config=onUpdateConfig :disableControls=disableControls />
      <CdnEstimatedCosts />
      <!-- deploy button -->
      <button
        @click=deployCdn
        :disabled="!canDeploy"
        class="button button--success self-end w-full md:max-w-xs"
      >
          <div v-if="deploying" class="flex flex-row items-center">
            <span>Deploying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
        <span v-else>Deploy</span>
      </button>
    </div>
    <div class="flex md:justify-end mt-2"><HttpError :error=httpError /></div>
  </div>
</template>

<script>
/* global process */

import * as utils from '@edge/account-utils'
import CdnConfig from '@/components/cdn/CdnConfig.vue'
import CdnDisplayName from '@/components/cdn/CdnDisplayName.vue'
import CdnDomains from '@/components/cdn/CdnDomains.vue'
import CdnEstimatedCosts from '@/components/cdn/CdnEstimatedCosts.vue'
import DeploymentWarning from '../../components/DeploymentWarning.vue'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Tooltip from '@/components/Tooltip'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'CdnDeploy',
  title() {
    return 'Edge Account Portal » Content Delivery'
  },
  components: {
    CdnConfig,
    CdnDisplayName,
    CdnDomains,
    CdnEstimatedCosts,
    DeploymentWarning,
    HttpError,
    LoadingSpinner,
    Tooltip
},
  data() {
    return {
      deployed: false,
      deploying: false,
      deployedIntegration: null,
      dnsRecords: [],
      httpError: null,
      integration: {
        name: '',
        configMode: undefined,
        data: {
          service: 'cdn',
          config: {
            additionalDomains: [],
            domain: '',
            origin: '',
            maxAssetSize: undefined,
            requestTimeout: undefined,
            retryTimeout: undefined,
            cache: {
              enabled: true,
              ttl: 86400,
              paths: {}
            }
          }
        }
      },
      integrationKey: null
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'balance', 'isTestnet', 'session']),
    canDeploy() {
      return !this.deploying &&
        this.integration.name &&
        this.integration.data.config.domain &&
        this.integration.data.config.origin
    },
    disableControls() {
      return this.balanceSuspend || this.balanceWarning
    }
  },
  methods: {
    continueToIntegration() {
      this.$router.push({ name: 'CdnIntegration', params: { key: this.deployedIntegration._key } })
    },
    async createDnsRecord(index) {
      const recordToCreate = this.dnsRecords[index]
      try {
        recordToCreate.creating = true
        this.dnsRecords.splice(index, 1, recordToCreate)
        const isApex = recordToCreate.domain === recordToCreate.zone
        const subDomain = recordToCreate.domain.replace('.' + recordToCreate.zone, '')

        const { record } = await utils.createDnsZoneRecord(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, recordToCreate.zone, {
          account: this.account._key,
          name: isApex ? '@' : subDomain,
          ttl: 3600,
          type: isApex ? 'ALIAS' : 'CNAME',
          value: `gateway.${this.isTestnet ? 'test' : 'edge'}.network.`
        })

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
    async deployCdn() {
      try {
        this.deploying = true
        this.httpError = null
        const { integration } = await utils.createIntegration(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          ...this.integration,
          account: this.account._key
        })
        this.deployedIntegration = integration

        const { records } = await utils.checkIntegrationDnsRecords(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, integration._key)
        this.dnsRecords = records

        await new Promise(resolve => setTimeout(resolve, 800))
        this.deployed = true
      }
      catch (error) {
        await new Promise(resolve => setTimeout(resolve, 800))
        this.deploying = false
        this.httpError = error
      }
    },
    onUpdateConfig(config, configMode) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, ...config }
      integration.configMode = configMode
      this.integration = integration
    },
    onUpdateDetails(name) {
      this.integration = { ...this.integration, name }
    },
    onUpdateDomains(domains) {
      const integration = { ...this.integration }
      const domain = domains.find(domain => domain.primary)
      integration.data.config.domain = domain && domain.name
      integration.data.config.additionalDomains = domains.filter(domain =>  !domain.primary).map(domain => domain.name)
      this.integration = integration
    }
  },
  watch: {
    integration() {
      this.httpError = null
    }
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
</style>
