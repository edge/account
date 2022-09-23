<template>
  <CdnDetails
    ref="cdnDetails"
    :initialDisplayName=liveDisplayName
    :initialOriginUrl=liveOriginUrl
    @update-details=onUpdateDetails
  >
    <template v-slot:buttons>
      <div class="flex space-x-2 justify-end mt-4">
        <button
          @click=resetChanges
          class="button button--outline button--small"
        >
          Cancel
        </button>
        <button
          @click=saveChanges
          :disabled="!canSaveChanges"
          class="button button--success button--small"
        >
          Save Changes
        </button>
      </div>
    </template>
  </CdnDetails>
</template>

<script>
import CdnDetails from '@/components/cdn/CdnDetails'

export default {
  name: 'IntegrationDetails',
  props: ['integration'],
  components: {
    CdnDetails
  },
  data() {
    return {
      workingDisplayName: '',
      workingOriginUrl: ''
    }
  },
  computed: {
    canSaveChanges() {
      return this.liveDisplayName !== this.workingDisplayName ||
        this.liveOriginUrl !== this.workingOriginUrl
    },
    liveDisplayName() {
      return this.integration.name
    },
    liveOriginUrl() {
      return this.integration.data.config.origin
    }
  },
  methods: {
    onUpdateDetails(newDisplayName, newOriginUrl) {
      this.workingDisplayName = newDisplayName
      this.workingOriginUrl = newOriginUrl
    },
    resetChanges() {
      this.$refs.cdnDetails.resetDetails()
    },
    saveChanges() {
      console.log('saving')
    }
  },
  mounted() {
    this.resetChanges()
  }
}
</script>

<style scoped>

</style>
