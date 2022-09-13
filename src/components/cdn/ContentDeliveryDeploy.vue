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
      </div>
      <!-- config -->
      <div class="box">
        <h4>Configuration</h4>
      </div>
      <button class="button button--success">Deploy</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContentDeliveryDeploy'
}
</script>

<style scoped>

</style>
