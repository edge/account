<template>
  <div class="mainContent__inner instance">
    <div class="w-max">
      <router-link :to="{ name: 'Storage' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>Storage Instances</span>
      </router-link>
    </div>

    <!-- @TODO replace with editable instance name, like CdnIntegration -->
    <div v-if="instance" class="w-full flex flex-wrap justify-between items-center">
      <h1 class="mr-2">{{ instance.name }}</h1>
      <div class="mb-4" v-if="instance">
        <StatusDot :isActive="true" :isInactive="false" :large="true" :statusText="'active'" />
      </div>
    </div>

    <div v-if=deleted class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Storage Deleted</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This storage instance and all of its associated files have been destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'Storage'}"
        >
          <span>Return to Storage Instances</span>
        </router-link>
      </div>
    </div>

    <div v-else-if=notFound class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Storage instance not found</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This storage instance either does not exist or has destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'Storage'}"
        >
          <span>Return to Storage Instances</span>
        </router-link>
      </div>
    </div>

    <!-- tabs -->
    <div v-else-if="instance" class="pt-4">
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
          </TabList>
          <TabPanels class="mt-4">
            <!-- records -->
            <TabPanel>
              <!-- balance suspend warning -->
              <div v-if="balanceSuspend" class="box mb-4 suspend">
                <div class="float-left mr-2 mt-2"><ExclamationIcon class="w-5 text-red" /></div>
                <div class="mt-2 text-red">You are unable to add, edit or delete files as your balance is low. Please add funds or enable Pay by Credit Card to re-enable this service.</div>
              </div>
              <FileList :instance="instance" ref="fileList" />
            </TabPanel>
            <!-- configure -->
            <TabPanel>
              <div class="flex flex-col space-y-4">
                <InstanceConfig />
                <InstanceDestroy :instance="instance" @delete-instance="onDeleteInstance" />
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

import * as api from '@/account-utils'
import FileList from '@/components/storage/FileList'
import FileUpload from '@/components/storage/FileUpload'
import InstanceConfig from '@/components/storage/InstanceConfig'
import InstanceDestroy from '@/components/storage/InstanceDestroy'
import StatusDot from '@/components/StatusDot'
import { ArrowLeftIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'StorageInstance',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    ArrowLeftIcon,
    ExclamationIcon,
    FileList,
    FileUpload,
    InstanceConfig,
    InstanceDestroy,
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
      instance: null,
      iInstance: null,
      loading: false,
      notFound: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['balance', 'config', 'session']),
    instanceId() {
      return this.$route.params.key
    },
    isActive() {
      // @TODO
      return true
      // return this.instance.active
    },
    statusText() {
      return this.isActive ? 'Active' : 'Inactive'
    }
  },
  methods: {
    onUploadFile() {
      this.$refs.recordsList.updateRecords()
    },
    onDeleteInstance() {
      clearInterval(this.iInstance)
      this.deleted = true
    },
    async updateInstance() {
      this.instance = {
        _key: '1234',
        name: 'My Test Storage',
        config: {}
      }
      return

      // @TODO
      // try {
      //   const { instance } = await api.storage.getInstance(
      //     process.env.VUE_APP_ACCOUNT_API_URL,
      //     this.session._key,
      //     this.instanceId
      //   )
      //   this.instance = instance
      // }
      // catch (error) {
      //   console.error(error)
      //   if (error.status === 404) {
      //     this.notFound = true
      //     clearInterval(this.iInstance)
      //   }
      // }
    }
  },
  mounted() {
    this.loading = true
    this.updateInstance()
    this.iInstance = setInterval(() => {
      this.updateInstance()
    }, 10 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iInstance)
    this.iInstance = null
  }
}
</script>
<style scoped>
.box.suspend {
  @apply pt-4;
}
.mainContent__inner.instance {
  @apply pt-0 mt-6;
}
</style>
