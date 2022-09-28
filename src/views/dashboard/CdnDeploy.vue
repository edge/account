<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge CDN</h1>
    <div class="flex flex-col space-y-4">
      <!-- details -->
      <CdnDetails @update-details=onUpdateDetails />
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
import CdnDetails from '@/components/cdn/CdnDetails.vue'
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
    CdnDetails,
    CdnDomains,
    CdnEstimatedCosts,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      deploying: false,
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
      }
    }
  },
  computed: {
    ...mapState(['session']),
    canDeploy() {
      return !this.deploying &&
        this.integration.name &&
        this.integration.data.domain &&
        this.integration.data.config.origin
    }
  },
  methods: {
    async deployCdn() {
      try {
        this.deploying = true
        this.httpError = null
        const { integration } = await api.cdn.addIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration
        )
        setTimeout(() => {
          this.$router.push({ name: 'CdnIntegration', params: { key: integration._key } })
        }, 800)
      }
      catch (error) {
        console.error(error)
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
    onUpdateDetails(name, origin) {
      const integration = { ...this.integration }
      integration.name = name
      integration.data.config.origin = origin
      this.integration = integration
    },
    onUpdateDomains(domains) {
      const integration = { ...this.integration }
      const domain = domains.find(domain => domain.primary)
      integration.data.domain = domain && domain.name
      integration.data.additionalDomains = domains.filter(domain =>  !domain.primary).map(domain => domain.name)
      this.integration = integration
    }
  }
}
</script>

<style scoped>

</style>
