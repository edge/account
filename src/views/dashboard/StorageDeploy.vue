<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge Storage</h1>
    <!-- Successfully deployed -->
    <div v-if="deployed" class="space-y-4">
      <div class="box md:text-center">
        <h4 class="text-green text-2xl">Success</h4>
        <div class="max-w-xl m-auto">
          <span>Your storage deployment has been activated.</span>
        </div>
      </div>
      <div class="box">
        <div>
          <h4>Storage API Key</h4>
          <p class="text-gray-500">Your unique API key facilitates secure access to Storage, allowing for script automation and direct uploads. Remember to keep it confidential to ensure the security of your data.</p>
        </div>
        <!-- account number display -->
        <div class="api-key-wrapper">
          <span v-if="showApiKey" class="api-key monospace">{{ apiKey }}</span>
          <span v-else class="api-key masked monospace">{{ maskedApiKey }}</span>
          <!-- hide/show account number button button -->
          <button
            @click.prevent="toggleShowApiKey"
            class="ml-2 text-gray-400 hover:text-green"
          >
            <EyeIcon v-if="showApiKey" class="ml-2 w-5 h-5" />
            <EyeOffIcon v-else class="ml-2 w-5 h-5" />
          </button>
        </div>
        <button
            @click=continueToIntegration
            class="button button--small button--success w-full md:max-w-xs mt-5"
          >
            Continue to Deployment
          </button>
      </div>
    </div>

    <!-- Deploy form -->
    <div v-else class="flex flex-col space-y-4">
      <!-- balance warning message -->
      <DeploymentWarning v-if="balanceSuspend || balanceWarning" />

      <!-- details -->
      <DeployIntegrationDisplayName
        @update-details="onUpdateName"
        :disableControls="disableControls"
      />
      <Config
        @update-config="onUpdateConfig"
        :disableControls="disableControls"
      />
      <EstimatedCosts />

      <!-- deploy button -->
      <button
        @click="deployStorage"
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

import * as utils from '@edge/account-utils'
import Config from '@/components/storage/Config.vue'
import DeployIntegrationDisplayName from '@/components/storage/DeployIntegrationDisplayName.vue'
import DeploymentWarning from '../../components/DeploymentWarning.vue'
import EstimatedCosts from '@/components/storage/EstimatedCosts.vue'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { v4 as uuidv4 } from 'uuid'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'StorageDeploy',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    Config,
    DeployIntegrationDisplayName,
    DeploymentWarning,
    EstimatedCosts,
    EyeIcon,
    EyeOffIcon,
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
        configMode: 'advanced',
        data: {
          service: 'storage',
          config: {
            apiKeys: {
              [uuidv4()]: {
                active: true
              }
            }
          }
        }
      },
      integrationKey: null,
      showApiKey: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'balance', 'isTestnet', 'session']),
    canDeploy() {
      return !this.deploying &&
        this.integration.name &&
        this.integration.data.config
    },
    disableControls() {
      return this.balanceSuspend || this.balanceWarning
    },
    apiKey() {
      let apiKey = ''
      for (const key in this.deployedIntegration.data.config.apiKeys) {
        if (this.deployedIntegration.data.config.apiKeys[key].active) apiKey = key
      }
      return apiKey
    },
    maskedApiKey() {
      return this.apiKey.replaceAll(/[a-zA-Z0-9]/gi, 'x')
    }
  },
  methods: {
    continueToIntegration() {
      this.$router.push({ name: 'Storage Integration', params: { key: this.deployedIntegration._key } })
    },
    async deployStorage() {
      try {
        this.deploying = true
        this.httpError = null
        const { integration } = await utils.createIntegration(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          ...this.integration,
          account: this.account._key
        })
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
    onUpdateConfig(config, configMode) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, ...config }
      integration.configMode = configMode
      this.integration = integration
    },
    onUpdateName(name) {
      this.integration = { ...this.integration, name }
    },
    toggleShowApiKey() {
      this.showApiKey = !this.showApiKey
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
