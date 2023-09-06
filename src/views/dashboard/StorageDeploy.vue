<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge Storage</h1>
    <!-- Successfully deployed -->
    <div v-if="deployed" class="space-y-4">
      <div class="box md:text-center">
        <h4 class="text-green text-2xl">Success</h4>
        <div class="max-w-xl m-auto">
          <span>Storage has been successfully deployed to the network.</span>
        </div>
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
      <DeployInstanceEstimatedCosts />

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
import DeployInstanceEstimatedCosts from '@/components/storage/DeployInstanceEstimatedCosts.vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'StorageDeploy',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    DeployInstanceDisplayName,
    DeployInstanceEstimatedCosts,
    ExclamationIcon,
    HttpError,
    Config,
    LoadingSpinner
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
      instanceKey: null
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
</style>
