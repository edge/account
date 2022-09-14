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
      <!-- domains -->
      <div class="box">
        <h4>Domains</h4>
        <!-- add domain form -->
        <div class="flex flex-col space-y-2 w-full sm:space-x-4 sm:space-y-0 sm:items-end sm:flex-row">
          <div class="flex-1 input-group">
            <label class="label">Add Domain</label>
            <input
              v-model="domainName"
              class="input input--floating"
              :disabled="false"
              :class="false ? 'disabled' : ''"
              placeholder="e.g. cdn.yoursite.com"
              type="text"
              required
            />
          </div>
          <!-- add button -->
          <button
            @click.prevent="addDomain"
            :disabled="true"
            class="button button--success button--small w-20"
          >
            <div v-if="false" class="flex items-center">
              <span>Adding</span>
              <div><LoadingSpinner class="ml-1 w-4" /></div>
            </div>
            <span v-else>Add</span>
          </button>
        </div>
        <!-- domains -->
        <!-- PLACEHOLDER START -->
        <div class="flex flex-col space-y-2 divide-y-2 divide-solid pt-4">
          <div class="flex items-center justify-between pt-2">
            <span class="text-lg">cdn.radiotimes.com</span>
            <button class="flex justify-center w-20"><DotsHorizontalIcon class="w-4" /></button>
          </div>
          <div class="flex items-center justify-between pt-2">
            <span class="text-lg">images.radiotimes.com</span>
            <button class="flex justify-center w-20"><DotsHorizontalIcon class="w-4" /></button>
          </div>
        </div>
        <!-- PLACEHOLDER END -->
      </div>
      <!-- config -->
      <CdnConfig />
      <button class="button button--success self-end w-full md:max-w-xs">Deploy</button>
    </div>
  </div>
</template>

<script>
import CdnConfig from '@/components/cdn/CdnConfig.vue'
import { DotsHorizontalIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'

export default {
  name: 'CdnDeploy',
  components: {
    CdnConfig,
    DotsHorizontalIcon,
    LoadingSpinner
  },
  data() {
    return {
      deployName: '',
      originUrl: '',
      domainName: ''
    }
  }
}
</script>

<style scoped>

</style>
