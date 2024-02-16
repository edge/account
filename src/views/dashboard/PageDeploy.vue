<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge Pages</h1>
    <!-- Successfully deployed -->
    <div v-if="deployed" class="space-y-4">
      <div class="box md:text-center">
        <h4 class="text-green text-2xl">Success</h4>
        <div class="max-w-xl m-auto">
          <span>Your page has been activated.</span>
        </div>

      </div>
      <div class="box">
        <h4>DNS Settings</h4>
        <div class="flex flex-col space-y-4 overflow-x-visible">
          <span>Please create the following DNS record to enabled Edge Pages to work:</span>
          <div class="overflow-x-auto">
            <table class="my-4 space-y-2">
              <tr>
                <th class="domain">Hostname</th>
                <th class="type">Type</th>
                <th>Value</th>
                <th class="ttl">TTL</th>
              </tr>
              <tr>
                <td class="domain monospace" :title="domain">{{ domain }}</td>
                <td class="type monospace">{{ recordType }}</td>
                <td class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</td>
                <td class="ttl monospace">3600</td>
              </tr>
            </table>
          </div>
          <span>You can set these up later, but Pages won't become operational until you do.</span>
          <span>Changes can take up to 24 hours. If you require any assistance, please contact support@edge.network</span>

          <div class="text-center">
            <button @click="continueToIntegration"
              class="button button--small button--success w-full md:max-w-xs mt-5">
                Continue to Deployment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deploy form -->
    <div v-else class="flex flex-col space-y-4">
      <DeploymentWarning v-if="balanceSuspend || balanceWarning" />

      <!-- details -->
      <DeployIntegrationDisplayName
        @update-details="onUpdateName"
        :disableControls="disableControls"
      />
      <DeployIntegrationDomain
        @update-details="onUpdateDomain"
        :disableControls="disableControls"
      />
      <DeployIntegrationContent
        @update-details="onUpdateContent"
        :disableControls="disableControls"
      />
      <!-- <EstimatedCosts /> -->

      <!-- deploy button -->
      <button
        @click="deployPage"
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

    <!-- deploy error -->
    <div class="flex md:justify-end mt-2"><HttpError :error=httpError /></div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/'
import DeployIntegrationContent from '@/components/page/DeployIntegrationContent.vue'
import DeployIntegrationDisplayName from '@/components/page/DeployIntegrationDisplayName.vue'
import DeployIntegrationDomain from '@/components/page/DeployIntegrationDomain.vue'
import DeploymentWarning from '../../components/DeploymentWarning.vue'
// import EstimatedCosts from '@/components/page/EstimatedCosts.vue'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'PagesDeploy',
  title() {
    return 'Edge Account Portal » Pages'
  },
  components: {
    DeployIntegrationContent,
    DeployIntegrationDisplayName,
    DeployIntegrationDomain,
    DeploymentWarning,
    // EstimatedCosts,
    HttpError,
    LoadingSpinner
},
  data() {
    return {
      deployed: false,
      deploying: false,
      deployedIntegration: null,
      apex: null,
      httpError: null,
      integration: {
        name: '',
        data: {
          service: 'page',
          config: {
            domain: '',
            content: ''
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
        this.integration.data?.config?.domain &&
        this.integration.data?.config?.content
    },
    domain() {
      return this.integration.data?.config?.domain
    },
    recordType() {
      return this.apex ? 'ALIAS' : 'CNAME'
    },
    disableControls() {
      return this.balanceSuspend || this.balanceWarning
    }
  },
  methods: {
    continueToIntegration() {
      this.$router.push({ name: 'Pages Integration', params: { key: this.deployedIntegration._key } })
    },
    async deployPage() {
      try {
        this.deploying = true
        this.httpError = null

        const { integration } = await api.integration.addIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          { ...this.integration, account: this.account._key }
        )
        this.deployedIntegration = integration

        // Check whether the domain is apex/not
        const psl = await api.helpers.pslParse(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          integration.data.config.domain
        )
        this.apex = psl.apex

        await new Promise(resolve => setTimeout(resolve, 800))
        this.deployed = true
      }
      catch (error) {
        await new Promise(resolve => setTimeout(resolve, 800))
        this.deploying = false
        this.httpError = error
      }
    },
    onUpdateName(name) {
      this.integration = { ...this.integration, name }
    },
    onUpdateDomain(domain) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, domain }
      this.integration = integration
    },
    onUpdateContent(content) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, content }
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

.api-key-wrapper {
  @apply flex items-center justify-between relative w-max max-w-full;
}
.api-key {
  @apply text-3xl text-green pr-4;
}
.api-key.masked {
  @apply text-gray;
}
</style>
