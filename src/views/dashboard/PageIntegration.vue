<template>
  <div class="mainContent__inner integration">
    <div class="w-max">
      <router-link :to="{ name: 'Pages' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" />
        <span>Pages</span>
      </router-link>
    </div>

    <div v-if="!loaded" class="flex items-center">
      <span>Loading pages</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else class="flex flex-col space-y-4">
      <div v-if="balanceSuspend || balanceWarning" class="box flex space-x-2">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to deploy new services.</span>
      </div>

      <!-- details -->
      <DeployIntegrationDisplayName
        @update-details="onUpdateName"
        :disableControls="disableControls"
        :initialDisplayName="name"
      />
      <DeployIntegrationDomain
        @update-details="onUpdateDomain"
        :disableControls="disableControls"
        :initialDomain="domain"
      />
      <DeployIntegrationContent
        @update-details="onUpdateContent"
        :disableControls="disableControls"
        :initialContent="content"
      />

      <div class="flex justify-between">
        <button class="button button--error w-1/4"
          @click="toggleConfirmationModal"
          >
          Delete
        </button>
        <button class="button button--success w-1/4"
          @click="updatePage"
          :disabled="!canUpdate"
          >
          <div v-if="updating" class="flex flex-row items-center">
            <span>Updating</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Update</span>
        </button>
      </div>
    </div>

    <!-- destroy confirmation modal -->
    <DeletePageConfirmation
      v-if="showConfirmationModal"
      @modal-confirm="confirmDeletePage"
      @modal-close="toggleConfirmationModal"
      :pageName="integration.name"
    />
  </div>
</template>

<style scoped>
.box.suspend {
  @apply pt-4;
}
.mainContent__inner.integration {
  @apply pt-0 mt-6;
}
</style>

<script>
/* global process */

import * as utils from '@edge/account-utils'
import DeletePageConfirmation from '@/components/confirmations/DeletePageConfirmation.vue'
import DeployIntegrationContent from '@/components/page/DeployIntegrationContent.vue'
import DeployIntegrationDisplayName from '@/components/page/DeployIntegrationDisplayName.vue'
import DeployIntegrationDomain from '@/components/page/DeployIntegrationDomain.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { ArrowLeftIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'PageIntegration',
  title() {
    return 'Edge Account Portal » Page'
  },
  components: {
    DeletePageConfirmation,
    DeployIntegrationContent,
    DeployIntegrationDisplayName,
    DeployIntegrationDomain,
    ArrowLeftIcon,
    ExclamationIcon,
    LoadingSpinner
  },
  data() {
    return {
      changed: false,
      deleted: false,
      integration: null,
      iIntegration: null,
      loading: false,
      notFound: false,
      updating: false,
      showConfirmationModal: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['balance', 'config', 'session']),
    integrationId() {
      return this.$route.params.key
    },
    loaded() {
      return !!this.integration
    },
    name() {
      return this.integration.name
    },
    domain() {
      return this.integration.data.config.domain
    },
    content() {
      return this.integration.data.config.content
    },
    isActive() {
      return this.integration.active
    },
    statusText() {
      return this.isActive ? 'Active' : 'Inactive'
    },
    canUpdate() {
      return this.changed &
        !this.updating &&
        this.integration.name &&
        this.integration.data?.config?.domain &&
        this.integration.data?.config?.content
    },
    disableControls() {
      return this.balanceSuspend || this.balanceWarning
    }
  },
  methods: {
    toggleConfirmationModal() {
      console.log('toggleConfirmationModal B', this.showConfirmationModal)
      this.showConfirmationModal = !this.showConfirmationModal
      console.log('toggleConfirmationModal A', this.showConfirmationModal)
    },
    onUpdateName(name) {
      this.integration = { ...this.integration, name }
      this.changed = true
    },
    onUpdateDomain(domain) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, domain }
      this.integration = integration
      this.changed = true
    },
    onUpdateContent(content) {
      const integration = { ...this.integration }
      integration.data.config = { ...integration.data.config, content }
      this.integration = integration
      this.changed = true
    },
    async confirmDeletePage() {
      try {
        await utils.deleteIntegration(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.integration._key)
        clearInterval(this.iIntegration)
        this.deleted = true
        this.showConfirmationModal = false
        this.$router.push({ name: 'Pages' })
      }
      catch (error) {
        console.error(error)
        if (error.status === 404) {
          this.notFound = true
          clearInterval(this.iIntegration)
        }
      }
    },
    async updatePage() {
      this.updating = true
      try {
        const { integration } = await utils.updateIntegration(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.integrationId, this.integration)
        this.integration = integration
        console.log(this.integration)
      }
      catch (error) {
        console.error(error)
        if (error.status === 404) {
          this.notFound = true
          clearInterval(this.iIntegration)
        }
      }
      this.updating = false
      this.changed = false
    },
    async updateIntegration() {
      try {
        const { integration } = await utils.getIntegration(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.integrationId)
        this.integration = integration

        console.log(this.integration)
      }
      catch (error) {
        console.error(error)
        if (error.status === 404) {
          this.notFound = true
          clearInterval(this.iIntegration)
        }
      }
    }
  },
  mounted() {
    this.loading = true
    this.updateIntegration()
    this.iIntegration = setInterval(() => {
      this.updateIntegration()
    }, 60 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iIntegration)
    this.iIntegration = null
  }
}
</script>
