<template>
  <div class="flex flex-col space-y-4">
    <CdnDomains
      :liveDomains=liveDomains
      @update-domains=onUpdateDomains
    >
      <template v-slot:buttons>
        <div class="flex space-x-2 justify-end mt-2">
          <button
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
    </CdnDomains>
  </div>
</template>

<script>
import CdnDomains from '@/components/cdn/CdnDomains'

export default {
  name: 'IntegrationDomains',
  props: ['integration'],
  components: {
    CdnDomains
  },
  data() {
    return {
      workingDomains: [
        {
          name: this.integration.data.domain,
          primary: true
        },
        ...this.integration.data.additionalDomains.map(domain => ({ name: domain }))
      ]
    }
  },
  computed: {
    canSaveChanges() {
      return JSON.stringify(this.liveDomains) !== JSON.stringify(this.workingDomains)
    },
    liveDomains() {
      return [
        {
          name: this.integration.data.domain,
          primary: true
        },
        ...this.integration.data.additionalDomains.map(domain => ({ name: domain }))
      ]
    }
  },
  methods: {
    onUpdateDomains(domains) {
      this.workingDomains = domains
    },
    saveChanges() {
      console.log('saving')
    }
  }
}
</script>

<style scoped>

</style>
