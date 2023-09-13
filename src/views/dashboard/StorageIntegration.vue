<template>
  <div class="mainContent__inner integration">
    <div class="w-max">
      <router-link :to="{ name: 'Storage' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>Storage</span>
      </router-link>
    </div>

    <!-- @TODO replace with editable integration name, like CdnIntegration -->
    <div v-if="integration" class="w-full flex flex-wrap justify-between items-center">
      <IntegrationDisplayName :integration="integration" />
      <div class="mb-4" v-if="integration">
        <StatusDot :isActive="true" :isInactive="false" :large="true" :statusText="'active'" />
      </div>
    </div>

    <div v-if=deleted class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Storage Deleted</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This storage deployment and all of its associated files have been destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'Storage'}"
        >
          <span>Return to Storage Deployments</span>
        </router-link>
      </div>
    </div>

    <div v-else-if=notFound class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Storage deployment not found</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This storage deployment either does not exist or has destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'Storage'}"
        >
          <span>Return to Storage Deployments</span>
        </router-link>
      </div>
    </div>

    <!-- tabs -->
    <div v-else-if="integration" class="pt-4">
      <TabGroup>
        <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
          <TabList class="tabs pr-6">
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Files
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Configure
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                API Key
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Destroy
              </button>
            </Tab>
          </TabList>
          <TabPanels class="mt-4">
            <!-- records -->
            <TabPanel>
              <!-- balance suspend warning -->
              <div v-if="balanceSuspend" class="box mb-4 suspend">
                <div class="float-left mr-2 mt-2"><ExclamationIcon class="w-5 text-red" /></div>
                <div class="mt-2 text-red">You are unable to add, edit or delete files as your balance is low. Please add funds or enable Pay by Credit Card to re-enable this service.</div>
              </div>
              <FileExplorer :integration="integration" ref="fileList" />
            </TabPanel>
            <!-- configure -->
            <TabPanel>
                <IntegrationConfig :integration="integration" />
            </TabPanel>
            <TabPanel>
              <IntegrationApiKey
                :integration="integration"
                @regenerate="updateIntegration"
              />
            </TabPanel>
            <TabPanel>
              <IntegrationDestroy
                :integration="integration"
                @delete-integration="onDeleteIntegration"
              />
            </TabPanel>
          </TabPanels>
      </TabGroup>
    </div>
    <!-- add new dns record -->
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import FileExplorer from '@/components/storage/FileExplorer'
import IntegrationApiKey from '@/components/storage/IntegrationApiKey'
import IntegrationConfig from '@/components/storage/IntegrationConfig'
import IntegrationDestroy from '@/components/storage/IntegrationDestroy'
import IntegrationDisplayName from '@/components/storage/IntegrationDisplayName'
import StatusDot from '@/components/StatusDot'
import { ArrowLeftIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'StorageIntegration',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    ArrowLeftIcon,
    ExclamationIcon,
    FileExplorer,
    IntegrationApiKey,
    IntegrationConfig,
    IntegrationDestroy,
    IntegrationDisplayName,
    StatusDot,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel
  },
  data() {
    return {
      deleted: false,
      integration: null,
      iIntegration: null,
      loading: false,
      notFound: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['balance', 'config', 'session']),
    integrationId() {
      return this.$route.params.key
    },
    isActive() {
      // @TODO
      return true
      // return this.integration.active
    },
    statusText() {
      return this.isActive ? 'Active' : 'Inactive'
    }
  },
  methods: {
    onUploadFile() {
      this.$refs.recordsList.updateRecords()
    },
    onDeleteIntegration() {
      clearInterval(this.iIntegration)
      this.deleted = true
    },
    async updateIntegration() {
      try {
        const { integration } = await api.storage.getIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integrationId
        )
        this.integration = integration
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
      // this.updateIntegration()
    }, 10 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iIntegration)
    this.iIntegration = null
  }
}
</script>
<style scoped>
.box.suspend {
  @apply pt-4;
}
.mainContent__inner.integration {
  @apply pt-0 mt-6;
}
</style>
