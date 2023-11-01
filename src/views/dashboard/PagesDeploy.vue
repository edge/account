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
      <div v-if="balanceSuspend || balanceWarning" class="box flex space-x-2">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to deploy new services.</span>
      </div>

      <!-- details -->
      <p>TODO B</p>

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
// /* global process */

// import * as api from '@/account-utils/'
// import DeployIntegrationDisplayName from '@/components/storage/DeployIntegrationDisplayName.vue'
// import EstimatedCosts from '@/components/storage/EstimatedCosts.vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { v4 as uuidv4 } from 'uuid'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'PagesDeploy',
  title() {
    return 'Edge Account Portal » Pages'
  },
  components: {
    // DeployIntegrationDisplayName,
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
    ...mapState(['balance', 'isTestnet', 'session']),
    canDeploy() {
      return !this.deploying &&
        this.integration.name &&
        this.integration.data.config
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
        // TODO
        // const { integration } = await api.integration.addIntegration(
        //   process.env.VUE_APP_ACCOUNT_API_URL,
        //   this.session._key,
        //   this.integration
        // )
        // this.deployedIntegration = integration

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
