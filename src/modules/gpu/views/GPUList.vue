<script setup>
import ListSortingMenu from '../../../components/ListSortingMenu.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import Pagination from '../../../components/Pagination.vue'

const gpus = []

const currentPage = 1
const limit = 20
const loaded = true
const totalCount = 0

const sortFields = [
  { label: 'Name', param: 'name' },
  { label: 'Created', param: 'created' }
]

function changePage(e) {
  console.log(e)
}
</script>

<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge GPUs</h1>
      <router-link
        v-if="gpus.length"
        :to="{ name: 'ServerDeploy' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy Server
      </router-link>
    </div>

    <div v-if="!loaded" class="flex items-center">
      <span>Loading servers</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <ul v-else-if="gpus.length" role="list" class="gpuList">
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
      <!--
      <ServerListItem
        v-for="gpu in gpus"
        :key="gpu._key"
        :regions=regions
        :server=server
      />
      -->
      <Pagination
        :currentPage="currentPage"
        :limit="limit"
        :totalCount="totalCount"
        @change-page="changePage"
      />
    </ul>

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

<style scoped>
  .gpuList {
    @apply space-y-2;
  }
</style>
