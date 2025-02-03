<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import DestroyServerConfirmation from '../../../components/confirmations/DestroyServerConfirmation.vue'
import DistroIcon from '../../../components/icons/DistroIcon.vue'
import EditableTitle from '../../../layout/EditableTitle.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import ProgressBar from '../../../components/ProgressBar.vue'
import ServerPowerToggle from '../../../components/server/ServerPowerToggle.vue'
import StatusDot from '../../../components/StatusDot.vue'
import Tooltip from '../../../components/Tooltip.vue'
import ValidationError from '../../../components/ValidationError.vue'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/vue/outline'
import { RouterLink, useRoute } from 'vue-router'
import { computed, effect, reactive, ref } from 'vue'
import { minLength, required } from '@vuelidate/validators'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import VPNOverview from '../components/VPNOverview.vue'

const route = useRoute()
const store = useStore()

const busy = ref(false)
const error = ref()
const loading = ref(false)
const region = ref()
const server = ref()
const vpn = ref()

const activeTasks = computed(() => {
  if (!store.value) return []
  if (!server.value) return []
  return store.value.getters.tasksByServerId(this.serverId)
})

const isCreating = computed(() => activeTasks.value.some(task => task.action === 'create'))
const isDestroying = computed(() => activeTasks.value.some(task => task.action === 'destroy'))
const isResizing = computed(() => activeTasks.value.some(task => task.action === 'resizeDisk' || task.action === 'resizeResource'))
const isRestoring = computed(() => activeTasks.value.some(task => task.action === 'restoreBackup'))

const showDestroyConfirmationModal = ref(false)

function toggleDestroyConfirmationModal() {
  showDestroyConfirmationModal.value = !showDestroyConfirmationModal.value
}

const formState = reactive({
  name: ''
})

const v$ = useVuelidate({
  name: [required, minLength(3)]
}, formState)

async function destroy() {
  console.log('WIP')
}

async function reload() {
  try {
    error.value = undefined
    loading.value = true

    let res = await utils.getVpn(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, route.params.id)
    server.value = res.server
    vpn.value = res.vpn

    res = await utils.getRegion(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, server.value.region)
    region.value = res.region
    reset()
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

function reset() {
  if (vpn.value) {
    v$.value.name.$model = vpn.value.name
  }
}

async function updateName() {
  try {
    error.value = undefined
    busy.value = true

    const res = await utils.updateVpn(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, route.params.id, {
      vpn: {
        name: v$.value.name.$model
      }
    })
    server.value = res.server
    vpn.value = res.vpn
    reset()
  }
  catch (err) {
    error.value = err
  }
  finally {
    busy.value = false
  }
}

effect(() => {
  reload()
})
</script>

<template>
  <div class="mainContent__inner vpn" v-if="vpn">
    <div class="w-max">
      <RouterLink :to="{ name: 'VPNs' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>VPNs</span>
      </RouterLink>
    </div>

    <!-- Title -->
    <EditableTitle
      v-model="v$.name.$model"
      placeholder="VPN name"
      :busy="busy"
      :invalid="v$.name.$invalid"
      @save="updateName"
    />
    <ValidationError :errors="v$.name.$errors" />

    <!-- IP and domain -->
    <div v-if="server" class="flex items-center mt-1 text-gray-500 truncate collapse sub-header space-x-2">
      <span>{{ server.network.ip[0] }}</span>
      <span class="divider" />
      <span class="truncate">{{ server.settings.domain }}</span>
    </div>

    <!-- Server overview -->
    <div v-if="server" class="flex items-center mt-3 space-x-3 text-gray-500 md:justify-between sm:mt-4 collapse status-row">
      <div class="relative flex-1">
        <div class="flex items-center justify-start space-x-2 collapse server-info">
          <div class="flex items-center flex-shrink-0 space-x-1 text-gray-900">
            <DistroIcon
              :os="server.settings.os.group"
              className="server-icon"
            />
            <span class="server-detail">{{ server.settings.os.version }}</span>
          </div>
          <span class="divider"/>
          <div class="flex items-center space-x-2 flex-shrink-0 specs">
            <span v-if="vpn.multiuser" class="server-detail">Multiuser</span>
            <span v-else>Single-user</span>
            <span class="divider"/>

            <span v-if="vpn.speed === 'fastest'" class="server-detail">Fastest</span>
            <span v-else-if="vpn.speed === 'faster'" class="server-detail">Faster</span>
            <span v-else class="server-detail">Fast</span>
            <span class="divider"/>
          </div>
          <div class="flex items-center space-x-1">
            <StatusDot
              :isActive="server.status === 'active'"
              :isInactive="server.status !== 'active'"
              :statusText="server.status === 'active' ? 'Active': 'Stopped'"
            />
            <Tooltip v-if="vpn.suspended" position="right" theme="error" text="Your VPN has been suspended due to unpaid invoices. When you add funds to your account it will automatically restart.">
              <InformationCircleIcon class="w-4" />
            </Tooltip>
          </div>
        </div>
      </div>
      <div class="flex-shrink-0" v-if="server">
        <ServerPowerToggle :disableActions="busy" :server="server" />
      </div>
    </div>

    <div v-if="vpn" class="grid items-start grid-cols-12 mt-4 space-x-10">
      <div class="col-span-12">
        <!-- Destroyed -->
        <div v-if="vpn.status === 'deleted'" class="box">
          <div class="flex flex-col items-center justify-center text-center">
            <h4>VPN Destroyed</h4>
            <p class="mb-0 text-gray-500">This VPN and all of its associated backups have been destroyed.</p>
            <router-link
              class="mt-4 button button--success button--small"
              :to="{ name: 'VPNs' }"
            >
              <span>Return to VPNs</span>
            </router-link>
          </div>
        </div>

        <!-- crashed -->
        <div v-else-if="vpn.status === 'crashed'" class="box">
          <div class="flex flex-col items-center justify-center text-center">
            <h4>Server Crashed</h4>
            <p class="mb-0 text-gray-500">There was a problem with your VPN, please either delete and re-deploy the VPN or contact support@edge.network for assistance.</p>
            <button
              class="mt-4 button button--error button--small w-full md:max-w-xs"
              :disabled="isDestroying"
              @click.prevent="toggleDestroyConfirmationModal"
            >
              <div v-if=isDestroying class="flex">
                <span>Destroying</span>
                <span class="ml-2"><LoadingSpinner /></span>
              </div>
              <span v-else>Destroy VPN</span>
            </button>
          </div>
          <!-- destroy confirmation modal -->
          <DestroyServerConfirmation
            v-if="server && showDestroyConfirmationModal"
            @modal-confirm="destroy"
            @modal-close="toggleDestroyConfirmationModal"
            :serverName="vpn.name"
          />
        </div>

        <!-- action in progress section -->
        <div v-else-if="isCreating || isDestroying || isResizing" class="box box--tall">
          <div class="flex flex-col items-center justify-center text-center">
            <h4 class="mt-4">
              <span v-if="isCreating">Deploying your new VPN</span>
              <span v-else-if="isDestroying">Destroying your VPN</span>
              <span v-else-if="isResizing">Resizing your VPN</span>
              <span v-else-if="isRestoring">Restoring your VPN backup</span>
            </h4>
            <p class="mt-2 mb-0 text-gray-500">This may take a few minutes. Feel free to close this page.</p>
            <div class="mt-4 max-w-full"><ProgressBar :red="isDestroying" /></div>
          </div>
        </div>

        <TabGroup v-else as="div" class="tabGroup">
          <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
          <TabList class="tabs pr-6">
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Overview
              </button>
            </Tab>
          </TabList>

          <TabPanels class="mt-4">
            <TabPanel v-if="region && server && vpn">
              <VPNOverview :region="region" :server="server" :vpn="vpn" />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mainContent__inner.vpn {
  @apply pt-0 mt-6;
}

.server-detail {
  @apply flex-shrink-0;
}
.server-icon {
  @apply w-4 h-4 text-gray-500 flex-shrink-0;
}
.specsGradient {
  @apply absolute top-0 right-0 w-10 h-full pointer-events-none bg-gradient-to-l from-gray-200;
}

.box.box--tall {
  @apply py-20 !important;
}

.divider {
  @apply h-4 bg-gray-400 w-px flex-shrink-0;
}


@media (max-width: 450px) {
  .collapse.sub-header {
    @apply flex-col space-x-0 items-start;
  }
  .collapse .divider {
    @apply hidden;
  }
  .collapse .specs {
    @apply flex-col items-start space-x-0
  }
  .collapse .specs .divider {
    @apply hidden;
  }
}

@media (min-width: 450px) and (max-width: 650px) {
  .collapse .specs .divider {
    @apply block
  }
  .collapse.sub-header .divider {
    @apply block
  }
}

@media (max-width: 650px) {
  .collapse.server-info {
    @apply flex-col items-start space-x-0 space-y-1;
  }
  .collapse .sub-header {
    @apply flex-col space-x-0 items-start;
  }
  .collapse .divider {
    @apply hidden;
  }
}

@screen md {
  .collapse.server-info {
    @apply flex-col items-start space-x-0 space-y-1;
  }
  .collapse.server-info .divider {
    @apply hidden;
  }
  .collapse .specs .divider {
    @apply block
  }
}

@screen lg {
  .collapse.server-info {
    @apply flex-row items-center space-x-2 space-y-0;
  }
  .collapse.server-info .divider {
    @apply block;
  }
}
</style>
