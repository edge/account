<template>
  <div class="box">
    <h4>Domains</h4>
    <!-- add domain form -->
    <div class="flex flex-col space-y-2 w-full sm:space-x-4 sm:space-y-0 sm:items-end sm:flex-row">
      <div class="flex-1 input-group">
        <label class="label">Add Domain</label>
        <input
          v-model="newDomainName"
          class="input input--floating"
          placeholder="e.g. cdn.yoursite.com"
          type="text"
        />
      </div>
      <!-- add button -->
      <button
        @click.prevent="addDomain"
        :disabled="!newDomainName"
        class="button button--success button--small w-20"
      >
        <span>Add</span>
      </button>
    </div>
    <!-- domains -->
    <CdnDomain v-for="domain in domains"
      :key=domain.name
      :domain=domain
      @delete-domain=onDeleteDomain
      @edit-domain=onEditDomain
      @make-domain-primary=onMakeDomainPrimary
    />
  </div>
</template>

<script>
import CdnDomain from '@/components/cdn/CdnDomain.vue'

export default {
  name: 'CdnDomains',
  components: {
    CdnDomain
  },
  data() {
    return {
      domains: [],
      newDomainName: ''
    }
  },
  methods: {
    addDomain() {
      const newDomain = { name: this.newDomainName }
      if (!this.domains.length) newDomain.primary = true
      this.domains = [ ...this.domains, newDomain]
      this.newDomainName = ''
    },
    onDeleteDomain(domainName) {
      const newDomains = [...this.domains.filter(domain => domain.name !== domainName)]
      console.log(newDomains)
      if (newDomains.length && !newDomains[0].primary) newDomains[0].primary = true
      this.domains = newDomains
    },
    onEditDomain(oldDomainName, newDomainName) {
      // eslint-disable-next-line max-len
      this.domains = [...this.domains.map(domain => domain.name === oldDomainName ? { ...domain, name: newDomainName } : domain)]
    },
    onMakeDomainPrimary(newPrimaryDomainName) {
      const newDomains = []
      this.domains.forEach(domain => {
        if (domain.name === newPrimaryDomainName) newDomains.unshift({ name: newPrimaryDomainName, primary: true })
        else newDomains.push({ name: domain.name })
      })
      this.domains = newDomains
    }
  }
}
</script>

<style scoped>

</style>
