<template>
  <div class="mainContent__inner mb-16">
    <h1>Edge CDN</h1>
    <div class="flex flex-col space-y-4">
      <!-- details -->
      <div class="box">
        <h4>Details</h4>
        <div class="flex flex-col pb-2 space-y-6">
          <div class="input-group">
            <label class="label">Name</label>
            <input
              v-model="deployName"
              class="input input--floating"
              :disabled="false"
              :class="false ? 'disabled' : ''"
              placeholder="Enter a deploy name"
              type="text"
              required
            />
          </div>
          <div class="input-group">
            <label class="label">Origin URL</label>
            <input
              v-model="originUrl"
              class="input input--floating"
              :disabled="false"
              :class="false ? 'disabled' : ''"
              placeholder="e.g. https://yoursite.com/photos"
              type="text"
              required
            />
          </div>
        </div>
      </div>
      <CdnDomains />
      <CdnConfig />
      <button class="button button--success self-end w-full md:max-w-xs">Deploy</button>
    </div>
  </div>
</template>

<script>
import CdnConfig from '@/components/cdn/CdnConfig.vue'
import CdnDomains from '@/components/cdn/CdnDomains.vue'

export default {
  name: 'CdnDeploy',
  components: {
    CdnConfig,
    CdnDomains
  },
  data() {
    return {
      deployName: '',
      originUrl: ''
    }
  }
}
</script>

<style scoped>

</style>
