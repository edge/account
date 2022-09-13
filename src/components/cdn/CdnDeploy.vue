<template>
  <div class="mainContent__inner">
    <h1>Edge CDN</h1>
    <div class="space-y-4">
      <!-- details -->
      <div class="box">
        <h4>Details</h4>
        <div class="flex flex-col pb-2 space-y-6">
          <div class="input-group">
            <label class="label">Name</label>
            <input
              v-model="name"
              class="input input--floating"
              :disabled="isDisabledTBD"
              :class="isDisabledTBD ? 'disabled' : ''"
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
              :disabled="isDisabledTBD"
              :class="isDisabledTBD ? 'disabled' : ''"
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
              v-model="name"
              class="input input--floating"
              :disabled="isDisabledTBD"
              :class="isDisabledTBD ? 'disabled' : ''"
              placeholder="e.g. cdn.yoursite.com"
              type="text"
              required
            />
          </div>
          <!-- add button -->
          <button
            @click.prevent="addDomain"
            :disabled="!canAddDomain"
            class="button button--success button--small"
          >
            <div v-if="addingDomain" class="flex items-center">
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
            <div><DotsHorizontalIcon class="w-4" /></div>
          </div>
          <div class="flex items-center justify-between pt-2">
            <span class="text-lg">images.radiotimes.com</span>
            <div><DotsHorizontalIcon class="w-4" /></div>
          </div>
        </div>
        <!-- PLACEHOLDER END -->
      </div>
      <!-- config -->
      <CdnConfig />
      <button class="button button--success">Deploy</button>
    </div>
  </div>
</template>

<script>
import CdnConfig from '@/components/cdn/CdnConfig.vue'
import { DotsHorizontalIcon } from '@heroicons/vue/outline'

export default {
  name: 'CdnDeploy',
  components: {
    CdnConfig,
    DotsHorizontalIcon
  }
}
</script>

<style scoped>

</style>
