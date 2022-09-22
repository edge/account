<template>
  <div class="mainContent__inner integration">
    <div class="w-max">
      <router-link :to="{ name: 'ContentDelivery' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>Content Delivery</span>
      </router-link>
    </div>
    <h1>{{ displayName }}</h1>
    <TabGroup
      v-if=integration
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
          <span>Domains</span>
        </button></Tab>
        <Tab v-slot="{selected}"><button
          class="tab"
          :class="[selected ? 'tab--selected' : '']"
        >
          <span>Configuration</span>
        </button></Tab>
        <Tab v-slot="{selected}"><button
          class="tab"
          :class="[selected ? 'tab--selected' : '']"
        >
          <span>Cache Flush</span>
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
        <!-- domains -->
        <TabPanel>
          <div class="space-y-4">
            <IntegrationDomains :integration=integration />
          </div>
        </TabPanel>
        <!-- configuration -->
        <TabPanel>
          <div class="space-y-4">
            <CdnDetails />
            <CdnConfig />
          </div>
        </TabPanel>
        <!-- cache flush -->
        <TabPanel>
          <div class="space-y-4">
            <div class="box"><h4>Cache Flush</h4></div>
          </div>
        </TabPanel>
        <!-- destroy -->
        <TabPanel>
          <div class="space-y-4">
            <div class="box"><h4>Destroy</h4></div>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import CdnConfig from '@/components/cdn/CdnConfig'
import CdnDetails from '@/components/cdn/CdnDetails'
import IntegrationDomains from '@/components/cdn/IntegrationDomains'
import IntegrationOverview from '@/components/cdn/IntegrationOverview'
import { mapState } from 'vuex'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'

export default {
  name: 'CdnIntegration',
  components: {
    ArrowLeftIcon,
    CdnConfig,
    CdnDetails,
    IntegrationDomains,
    IntegrationOverview,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels
  },
  data() {
    return {
      iIntegration: null,
      integration: null
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
    async updateIntegration() {
      try {
        const { integration } = await utils.cdn.getIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integrationKey
        )
        this.integration = integration
      }
      catch (error) {
        console.error(error)
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
