<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge Storage</h1>
      <router-link
        v-if="instancesCount"
        :to="{ name: 'Storage Deploy' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy Storage
      </router-link>
    </div>
    <InstanceList
      v-show="instancesCount"
      @update-integration-count=onUpdateInstancesCount
    />
    <div v-if="!loaded" class="flex items-center">
      <span>Loading storage instances</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="!instancesCount" class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <p>You don't have any storage instances yet. Once you create your first deployment it will be available here.</p>
        <router-link
          :to="{ name: 'Storage Deploy' }"
          class="button button--success button--small"
        >
          Deploy Storage
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import InstanceList from '@/components/storage/InstanceList'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'Storage',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    InstanceList,
    LoadingSpinner
  },
  data() {
    return {
      instancesCount: null,
      loaded: false
    }
  },
  computed: {
    ...mapState(['services'])
  },
  methods: {
    onUpdateInstancesCount(count) {
      this.instancesCount = count
      this.loaded = true
    }
  },
  mounted() {
    const service = this.services.find(s => s._key === 'storage')
    if (!service || (!service.public && !service.beta)) this.$router.push({ name: 'Not Found' })

    // TEMP
    this.onUpdateInstancesCount()
  }
}
</script>

<style scoped>
</style>
