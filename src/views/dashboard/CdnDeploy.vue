<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge CDN</h1>
    <div v-if="deployed" class="space-y-4">
      <div class="box md:text-center">
        <h4 class="text-green text-2xl">Success</h4>
        <!-- eslint-disable-next-line max-len -->
        <div class="max-w-xl m-auto"><span>CDN has been successfully deployed to the network. In order to become operational, DNS records must be created for each domain added.</span></div>
      </div>
      <div class="box">
        <h4>DNS Settings</h4>
        <div class="flex flex-col space-y-4 overflow-x-visible">
          <span>Please create the following DNS records to enabled CDN to work:</span>
          <ul class="my-4 space-y-2 overflow-x-auto">
            <li class="record">
              <span class="domain">Hostname</span>
              <span class="type">Type</span>
              <span class="ns">Nameserver</span>
              <span class="ttl">TTL</span>
            </li>
            <li class="record">
              <span class="domain monospace" :title="`${ deployedIntegration.data.domain }`">
                {{ deployedIntegration.data.domain }}
              </span>
              <span class="type monospace">CNAME</span>
              <span class="ns monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</span>
              <span class="ttl monospace">3600</span>
            </li>
            <li v-for="domain in deployedIntegration.data.additionalDomains" :key=domain class="record">
              <span class="domain monospace" :title="`${domain}`">
                {{ domain }}
              </span>
              <span class="type monospace">CNAME</span>
              <span class="ns monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</span>
              <span class="ttl monospace">3600</span>
            </li>
          </ul>
          <span>You can set these up later, but CDN won't become operational until you do.</span>
          <!-- eslint-disable-next-line max-len -->
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
      <!-- details -->
      <CdnDisplayName @update-details=onUpdateDetails />
      <CdnDomains @update-domains=onUpdateDomains />
      <CdnConfig @update-config=onUpdateConfig />
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
      <HttpError :error=httpError />
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/'
import CdnConfig from '@/components/cdn/CdnConfig.vue'
import CdnDisplayName from '@/components/cdn/CdnDisplayName.vue'
import CdnDomains from '@/components/cdn/CdnDomains.vue'
import CdnEstimatedCosts from '@/components/cdn/CdnEstimatedCosts.vue'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

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
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      deployed: false,
      deploying: false,
      deployedIntegration: null,
      httpError: null,
      integration: {
        name: '',
        data: {
          service: 'cdn',
          domain: '',
          additionalDomains: [],
          config: {
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
    ...mapState(['isTestnet', 'session']),
    canDeploy() {
      return !this.deploying &&
        this.integration.name &&
        this.integration.data.domain &&
        this.integration.data.config.origin
    }
  },
  methods: {
    continueToIntegration() {
      this.$router.push({ name: 'CdnIntegration', params: { key: this.deployedIntegration._key } })
    },
    async deployCdn() {
      try {
        this.deploying = true
        this.httpError = null
        const { integration } = await api.integration.addIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration
        )
        this.deployedIntegration = integration
        setTimeout(() => {
          this.deployed = true
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.deploying = false
          this.httpError = error
        }, 800)
      }
    },
    onUpdateConfig(config) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, ...config }
      this.integration = integration
    },
    onUpdateDetails(name) {
      this.integration = { ...this.integration, name }
    },
    onUpdateDomains(domains) {
      const integration = { ...this.integration }
      const domain = domains.find(domain => domain.primary)
      integration.data.domain = domain && domain.name
      integration.data.additionalDomains = domains.filter(domain =>  !domain.primary).map(domain => domain.name)
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
.record {
  @apply grid gap-x-4;
  grid-template-columns: 180px 50px 180px 50px
}
.record .domain {
  @apply truncate;
}

</style>
