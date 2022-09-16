<template>
  <div class="box">
    <h4>Details</h4>
    <div class="flex flex-col pb-2 space-y-6">
      <div class="input-group">
        <label class="label">Name</label>
        <input
          v-model="displayName"
          class="input input--floating"
          placeholder="Enter a display name"
          type="text"
        />
      </div>
      <div class="input-group">
        <label class="label">Origin URL</label>
        <input
          v-model="originUrl"
          class="input input--floating"
          placeholder="e.g. https://yoursite.com/photos"
          type="text"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CdnDetails',
  data() {
    return {
      displayName: '',
      originUrl: ''
    }
  },
  methods: {
    updateDetails() {
      this.$emit('update-details', this.displayName, this.originUrl)
    }
  },
  watch: {
    displayName() {
      this.updateDetails()
    },
    originUrl() {
      this.updateDetails()
    }
  }
}
</script>

<style scoped>

</style>
