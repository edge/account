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
        Deploy
      </button>
      <HttpError :error=httpError />
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils/'
import CdnConfig from '@/components/cdn/CdnConfig.vue'
import CdnDetails from '@/components/cdn/CdnDetails.vue'
import CdnDomains from '@/components/cdn/CdnDomains.vue'
import CdnEstimatedCosts from '@/components/cdn/CdnEstimatedCosts.vue'
import HttpError from '@/components/HttpError.vue'
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
    HttpError
  },
  data() {
    return {
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
      return this.integration.name &&
        this.integration.data.domain &&
        this.integration.data.config.origin
    }
  },
  methods: {
    async deployCdn() {
      try {
        this.httpError = null
        const { integration } = await utils.cdn.addIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration
        )
        console.log(integration)
        /** @todo redirect on complete */
      }
      catch (error) {
        console.error(error)
        this.httpError = error
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
