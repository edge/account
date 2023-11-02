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
        <button @click=continueToIntegration
          class="button button--small button--success w-full md:max-w-xs mt-5">
            Continue to Deployment
        </button>
      </div>
    </div>

    <!-- Deploy form -->
    <div v-else class="flex flex-col space-y-4">
      <!-- balance warning message -->
      <div v-if="balanceSuspend || balanceWarning" class="box flex space-x-2">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to deploy new services.</span>
      </div>

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
// import EstimatedCosts from '@/components/page/EstimatedCosts.vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
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
    // EstimatedCosts,
    ExclamationIcon,
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
    ...mapState(['balance', 'isTestnet', 'session']),
    canDeploy() {
      return !this.deploying &&
        this.integration.name &&
        this.integration.data?.config?.domain &&
        this.integration.data?.config?.content
    },
    disableControls() {
      return this.balanceSuspend || this.balanceWarning
    }
  },
  methods: {
    continueToIntegration() {
      this.$router.push({ name: 'Page Integration', params: { key: this.deployedIntegration._key } })
    },
    async deployPage() {
      try {
        this.deploying = true
        this.httpError = null

        const { integration } = await api.integration.addIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration
        )
        this.deployedIntegration = integration

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
