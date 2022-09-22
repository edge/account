<template>
  <div class="flex flex-col space-y-4">
    <CdnDomains
      :liveDomains=liveDomains
      @update-domains=onUpdateDomains
    />
    <button
      @click=saveChanges
      :disabled="!canSaveChanges"
      class="button button--success self-end w-full md:max-w-xs"
    >
      Save Changes
    </button>
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
