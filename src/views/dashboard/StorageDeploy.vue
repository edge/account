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
          <span v-if="showApiKey" class="api-key monospace">{{ deployedInstance.apiKey }}</span>
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
            @click=continueToInstance
            class="button button--small button--success w-full md:max-w-xs mt-5"
          >
            Continue
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
      <DeployInstanceDisplayName
        @update-details="onUpdateName"
        :disableControls="disableControls"
      />
      <Config
        @update-config="onUpdateConfig"
        :disableControls="disableControls"
      />
      <StorageEstimatedCosts />

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

import * as api from '@/account-utils/'
import Config from '@/components/storage/Config.vue'
import DeployInstanceDisplayName from '@/components/storage/DeployInstanceDisplayName.vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StorageEstimatedCosts from '@/components/storage/StorageEstimatedCosts.vue'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'StorageDeploy',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    Config,
    DeployInstanceDisplayName,
    ExclamationIcon,
    EyeIcon,
    EyeOffIcon,
    HttpError,
    LoadingSpinner,
    StorageEstimatedCosts,
  },
  data() {
    return {
      deployed: false,
      deploying: false,
      deployedInstance: null,
      httpError: null,
      instance: {
        name: '',
        configMode: 'advanced',
        data: {
          service: 'storage',
          config: {}
        }
      },
      instanceKey: null,
      showApiKey: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['balance', 'isTestnet', 'session']),
    canDeploy() {
      return !this.deploying &&
        this.instance.name &&
        this.instance.data.config
    },
    disableControls() {
      return this.balanceSuspend || this.balanceWarning
    },
    maskedApiKey() {
      return this.deployedInstance.apiKey.replaceAll(/[a-zA-Z0-9]/gi, 'x')
    }
  },
  methods: {
    continueToInstance() {
      this.$router.push({ name: 'Storage Instance', params: { key: this.deployedInstance._key } })
    },
    async deployStorage() {
      try {
        this.deploying = true
        this.httpError = null
        const { instance } = await api.storage.createInstance(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance
        )
        this.deployedInstance = instance

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
      const instance = { ...this.instance }
      instance.data.config = { ...instance.data.config, ...config }
      instance.configMode = configMode
      this.instance = instance
    },
    onUpdateName(name) {
      this.instance = { ...this.instance, name }
    },
    toggleShowApiKey() {
      this.showApiKey = !this.showApiKey
    }
  },
  watch: {
    instance() {
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
