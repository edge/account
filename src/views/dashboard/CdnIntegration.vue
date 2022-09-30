<template>
  <div class="mainContent__inner integration">
    <div class="w-max">
      <router-link :to="{ name: 'CdnIntegrations' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>Content Delivery</span>
      </router-link>
    </div>
    <h1>{{ displayName }}</h1>
    <div v-if=deleted class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>CDN Deployment Deleted</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This deployment has been destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'CdnIntegrations'}"
        >
          <span>Return to Content Delivery</span>
        </router-link>
      </div>
    </div>
    <TabGroup
      v-else-if=integration
      as="div"
      class="tabGroup"
    >
      <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
      <TabList class="tabs pr-6">
        <Tab v-slot="{selected}"><button
          class="tab"
          :class="[selected ? 'tab--selected' : '']"
        >
          <span>Overview</span>
        </button></Tab>
        <Tab v-slot="{selected}"><button
          class="tab"
          :class="[selected ? 'tab--selected' : '']"
        >
          <span>Cache</span>
        </button></Tab>
        <Tab v-slot="{selected}"><button
          class="tab"
          :class="[selected ? 'tab--selected' : '']"
        >
          <span>Settings</span>
        </button></Tab>
        <Tab v-slot="{selected}"><button
          class="tab"
          :class="[selected ? 'tab--selected' : '']"
        >
          <span>Destroy</span>
        </button></Tab>
      </TabList>
      <TabPanels class="mt-5">
        <!-- overview -->
        <TabPanel>
          <div class="space-y-4">
            <IntegrationOverview :integration=integration />
          </div>
        </TabPanel>
        <!-- cache flush -->
        <TabPanel>
          <IntegrationCache :integration=integration />
        </TabPanel>
        <!-- settings -->
        <TabPanel>
          <IntegrationSettings :integration=integration />
        </TabPanel>
        <!-- destroy -->
        <TabPanel>
          <IntegrationDestroy :integration=integration @confirm-delete=onConfirmDelete />
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <div v-else-if=notFound class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>CDN deployment not found</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This deployment either does not exist or has destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'Domains'}"
        >
          <span>Return to Content Delivery</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import IntegrationCache from '@/components/cdn/IntegrationCache'
import IntegrationDestroy from '@/components/cdn/IntegrationDestroy'
import IntegrationOverview from '@/components/cdn/IntegrationOverview'
import IntegrationSettings from '@/components/cdn/IntegrationSettings'
import { mapState } from 'vuex'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'

export default {
  name: 'CdnIntegration',
  title() {
    return 'Edge Account Portal » Content Delivery'
  },
  components: {
    ArrowLeftIcon,
    IntegrationCache,
    IntegrationDestroy,
    IntegrationOverview,
    IntegrationSettings,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels
  },
  data() {
    return {
      deleted: false,
      iIntegration: null,
      integration: null,
      notFound: false
    }
  },
  computed: {
    ...mapState(['session']),
    displayName() {
      return this.integration && this.integration.name
    },
    integrationKey() {
      return this.$route.params.key
    }
  },
  methods: {
    onConfirmDelete() {
      this.deleted = true
    },
    async updateIntegration() {
      try {
        const { integration } = await api.integration.getIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integrationKey
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
    this.updateIntegration()
    this.iIntegration = setInterval(() => {
      this.updateIntegration()
    }, 5 * 1000)
  },
  unmounted() {
    clearInterval(this.iIntegration)
  }
}
</script>

<style scoped>

</style>
