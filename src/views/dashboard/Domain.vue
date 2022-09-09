<template>
  <div class="mainContent__inner domain">
    <div class="w-max">
      <router-link :to="{ name: 'Domains' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>Domains</span>
      </router-link>
    </div>
    <div class="w-full flex flex-wrap justify-between items-center">
      <h1 class="mr-2">{{domainName}}</h1>
      <div class="mb-5" v-if=domain>
        <DomainStatus :domain=domain :large="true" />
      </div>
    </div>

    <div class="box mb-4" v-if="domain && !deleted">
      <!-- eslint-disable-next-line max-len -->
      <div class="float-left"><InformationCircleIcon class="w-5 mr-1"/></div>
      <span>You will need to update your nameservers with your domain registrar in order for these records to work.
        <!-- <a class="underline hover:text-green cursor-pointer">Learn more</a>. -->
      </span>
    </div>

    <div v-if=deleted class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Domain Deleted</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This domain and all of its associated records have been destroyed.</p>
        <router-link
          class="mt-4 button button--success"
          :to="{ name: 'Domains'}"
        >
          <span>Return to Domains</span>
        </router-link>
      </div>
    </div>

    <div v-else-if=notFound class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Domain not found</h4>
        </div>
        <router-link
          class="mt-4 button button--success"
          :to="{ name: 'Domains'}"
        >
          <span>Return to Domains</span>
        </router-link>
      </div>
    </div>

    <!-- tabs -->
    <div v-else-if=domain class="pt-4">
      <TabGroup>
        <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
          <TabList class="tabs pr-6">
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Records
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
          </TabList>
          <TabPanels class="mt-5">
            <!-- records -->
            <TabPanel>
              <!-- balance suspend warning -->
              <div v-if="balanceSuspend" class="box mb-5 suspend">
                <div class="float-left mr-2 mt-2"><ExclamationIcon class="w-5 text-red" /></div>
                <!-- eslint-disable-next-line max-len -->
                <div class="mt-2 text-red">You are unable to add, edit or delete records as your balance is low. Please add funds to re-enable this service.</div>
              </div>
              <div class="box">
                <h4 class="mb-2">Add a new record</h4>
                <NewRecordForm @createRecord=onCreateRecord />
              </div>
              <DomainRecordsList :domain=domain ref="recordsList" />
            </TabPanel>
            <!-- configure -->
            <TabPanel>
              <div class="flex flex-col space-y-4">
                <NameserversConfigure />
                <DomainDelete :domain=domain @delete-domain=onDeleteDomain />
              </div>
            </TabPanel>
          </TabPanels>
      </TabGroup>
    </div>
    <!-- add new dns record -->
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import DomainDelete from '@/components/domain/DomainDelete'
import DomainRecordsList from '@/components/domain/DomainRecordsList'
import DomainStatus from '@/components/domain/DomainStatus'
import NameserversConfigure from '@/components/domain/NameserversConfigure'
import NewRecordForm from '@/components/domain/NewRecordForm'
import { ArrowLeftIcon, ExclamationIcon, InformationCircleIcon } from '@heroicons/vue/outline'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Domain',
  title() {
    return 'Edge Account Portal » Domain'
  },
  components: {
    ArrowLeftIcon,
    DomainDelete,
    DomainRecordsList,
    DomainStatus,
    ExclamationIcon,
    InformationCircleIcon,
    NameserversConfigure,
    NewRecordForm,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel
  },
  data() {
    return {
      deleted: false,
      domain: null,
      iDomain: null,
      loading: false,
      notFound: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['balance', 'config', 'session']),
    domainName() {
      return this.$route.params.key
    }
  },
  methods: {
    onCreateRecord() {
      this.$refs.recordsList.updateRecords()
    },
    onDeleteDomain() {
      clearInterval(this.iDomain)
      this.deleted = true
    },
    async updateDomain() {
      try {
        this.domain = await utils.dns.getZone(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.domainName
        )
      }
      catch (error) {
        this.notFound = true
      }
    }
  },
  mounted() {
    this.loading = true
    this.updateDomain()
    this.iDomain = setInterval(() => {
      this.updateDomain()
    }, 10 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iDomain)
    this.iDomain = null
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}
.box.suspend {
  @apply pt-4;
}
.mainContent__inner.domain {
  @apply pt-0 mt-6;
}
</style>
