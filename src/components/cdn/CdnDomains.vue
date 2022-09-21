<template>
  <div class="box">
    <h4>Domains</h4>
    <!-- add domain form -->
    <div class="domainName__form">
      <div class="flex-1 input-group">
        <label class="label">Add Domain</label>
        <input
          v-model="v$.newDomainName.$model"
          class="input input--floating"
          placeholder="e.g. cdn.yoursite.com"
          type="text"
          @keypress="addDomainOnEnter"
        />
      </div>
      <!-- add button -->
      <button
        @click.prevent="addDomain"
        :disabled="!canAddDomain"
        class="button button--success button--small w-full"
      >
        <span>Add</span>
      </button>
    </div>
    <ValidationError :errors="v$.newDomainName.$errors" />
    <!-- domains -->
    <div class="flex flex-col mt-1 divide-y">
      <CdnDomain v-for="domain in domains"
        :key=domain.name
        :domain=domain
        @delete-domain=onDeleteDomain
        @edit-domain=onEditDomain
        @make-domain-primary=onMakeDomainPrimary
      />
    </div>
  </div>
</template>

<script>
import * as validation from '../../utils/validation'
import CdnDomain from '@/components/cdn/CdnDomain.vue'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'CdnDomains',
  components: {
    CdnDomain,
    ValidationError
  },
  data() {
    return {
      domains: [],
      newDomainName: ''
    }
  },
  validations() {
    return {
      newDomainName: [
        validation.domain
      ]
    }
  },
  computed: {
    canAddDomain() {
      return !this.v$.newDomainName.$invalid
    }
  },
  methods: {
    async addDomain() {
      if (!this.canAddDomain) return
      const newDomain = { name: this.newDomainName.toLowerCase() }
      if (!this.domains.length) newDomain.primary = true
      this.domains = [ ...this.domains, newDomain]
      this.newDomainName = ''
      await this.v$.$reset()
    },
    addDomainOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.addDomain()
    },
    onDeleteDomain(domainName) {
      const newDomains = [...this.domains.filter(domain => domain.name !== domainName)]
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
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    domains() {
      this.$emit('update-domains', this.domains)
    }
  }
}
</script>

<style scoped>
.domainName__form {
  @apply flex flex-col space-y-2 w-full;
}

@media (min-width: 450px) {
  .domainName__form {
    @apply space-x-4 space-y-0 items-end flex-row
  }
  .domainName__form .button {
    @apply w-20;
  }
}
</style>
