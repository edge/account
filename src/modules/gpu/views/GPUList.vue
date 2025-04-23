<script setup>
/* global process */

// import ListSortingMenu from '../../../components/ListSortingMenu.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import Pagination from '../../../components/Pagination.vue'
import StatusDot from '../../../components/StatusDot.vue'
import superagent from 'superagent'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { effect, ref } from 'vue'

const router = useRouter()
const store = useStore()

const currentPage = 1
const error = ref()
const gpus = ref([])
const limit = 20
const loading = ref(true)
const totalCount = 0

// const sortFields = [
//   { label: 'Name', param: 'name' },
//   { label: 'Created', param: 'created' }
// ]

function changePage(e) {
  console.log(e)
}

async function reload() {
  try {
    loading.value = true
    error.value = undefined

    const res = await superagent.get(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    gpus.value = res.body.vms
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

effect(() => {
  reload()
})
</script>

<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge GPUs</h1>
      <router-link
        v-if="gpus.length"
        :to="{ name: 'Deploy GPU' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy GPU
      </router-link>
    </div>

    <div v-if="loading" class="flex items-center">
      <span>Loading GPUs</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <div v-else-if="gpus.length">
      <!--
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
      -->
      <ul role="list" class="space-y-2">
        <li
          v-for="gpu in gpus"
          class="grid grid-cols-2 lg:grid-cols-4 gap-y-4 bg-white text-gray-500 border-l-8 border-gray-400 rounded-md w-full p-5 pr-8 cursor-pointer transition-all duration-100"
          :class="{ 'border-green': gpu.status === 'active', 'border-red': gpu.status !== 'active' }"
          :key="gpu.id"
          @click="router.push({ name: 'GPU', params: { id: gpu.id }})"
        >
          <!-- Basic details -->
          <div class="flex flex-col details overflow-hidden">
            <!-- Name -->
            <span class="text-md text-gray-500 truncate">{{ gpu.name }}</span>
            <!-- IP address / hostname -->
            <div class="flex flex-row space-x-1 text-m">
              <span v-if="gpu.ipAddress">{{ gpu.ipAddress }}</span>
              <span v-if="gpu.ipAddress" class="h-full bg-gray-400 block" style="width: 1px"></span>
              <div class="truncate" :data="gpu.hostname">{{ gpu.hostname }}</div>
            </div>
          </div>

          <!-- Specs -->
          <div class="flex flex-col lg:flex-shrink-0" style="flex-basis: 320px">
            <!-- GPU model -->
            <div class="text-md mr-2 sm:mr-0">
              <span>{{ gpu.gpuModel }}</span>
            </div>
            <!-- specs -->
            <div class="flex flex-col space-x-0 sm:flex-row sm:space-x-1.5 text-m">
              <span>{{ gpu.gpuCount }} GPU</span>
              <span class="h-full bg-gray-400 block" style="width: 1px"></span>
              <span>{{ gpu.cpuCount }} vCPU</span>
              <span class="h-full bg-gray-400 block" style="width: 1px"></span>
              <span>{{ gpu.diskGiB }} GiB Disk</span>
              <span class="h-full bg-gray-400 block" style="width: 1px"></span>
              <span>{{ gpu.memoryGiB }} GiB RAM</span>
            </div>
          </div>

          <!-- Created -->
          <div class="flex flex-col">
            <span class="text-md mr-2 sm:mr-0">Created</span>
            <span class="text-m">{{ gpu.created }}</span>
          </div>

          <!-- status dot -->
          <div class="flex flex-col">
            <span class="text-md mr-2 sm:mr-0">Status</span>
            <StatusDot :isActive="gpu.status === 'active'" :isInactive="gpu.status !== 'active'" small :statusText="gpu.status === 'active' ? 'Active' : 'Inactive'" />
          </div>
        </li>
      </ul>
      <Pagination
        :currentPage="currentPage"
        :limit="limit"
        :totalCount="totalCount"
        @change-page="changePage"
      />
    </div>

    <div v-else class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <p>You haven't deployed any GPUs yet. Once you deploy your first GPU it will be available here.</p>
        <router-link
          :to="{ name: 'Deploy GPU' }"
          class="button button--success button--small"
        >
          Deploy GPU
        </router-link>
      </div>
    </div>
  </div>
</template>
