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
          @keypress.enter=addDomain
          :disabled=disableControls
          :class="disableControls ? 'disabled' : ''"
        />
        <!-- errors -->
        <div v-if="newDomainName && domainsLimitReached" class="errorMessage mt-1">
          <div class="float-left"><ExclamationIcon class="w-3.5" /></div>
          <span class="errorMessage__text">Max domains limit reached</span>
        </div>
        <ValidationError v-if="!domainsLimitReached" :errors="v$.newDomainName.$errors" />
        <div v-if="!domainsLimitReached && domainAlreadyExists" class="errorMessage mt-1">
          <div class="float-left"><ExclamationIcon class="w-3.5" /></div>
          <span class="errorMessage__text">Domain already in use</span>
        </div>
      </div>
      <!-- add button -->
      <div class="button__wrapper">
        <button
          @click.prevent="addDomain"
          :disabled="!canAddDomain"
          class="button button--success button--small w-full"
        >
          <span>Add</span>
        </button>
      </div>
    </div>
    <!-- domains -->
    <div class="flex flex-col mt-1 divide-y">
      <CdnDomain v-for="domain in domains"
        :key=domain.name
        :disableControls=disableControls
        :domain=domain
        @delete-domain=onDeleteDomain
        @edit-domain=onEditDomain
        @make-domain-primary=onMakeDomainPrimary
      />
    </div>
    <!-- for save/cancel buttons when editing existing integrations -->
    <slot name="buttons" />
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import CdnDomain from '@/components/cdn/CdnDomain.vue'
import { ExclamationIcon } from '@heroicons/vue/outline'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'CdnDomains',
  props: ['disableControls', 'liveDomains'],
  components: {
    CdnDomain,
    ExclamationIcon,
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
      return !this.v$.newDomainName.$invalid && !this.domainAlreadyExists && !this.domainsLimitReached
    },
    domainAlreadyExists() {
      return this.domains.some(domain => domain.name === this.newDomainName)
    },
    domainsLimitReached() {
      return this.domains.length >=5
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
    onDeleteDomain(domainName) {
      const newDomains = [...this.domains.filter(domain => domain.name !== domainName)]
      if (newDomains.length && !newDomains[0].primary) newDomains[0].primary = true
      this.domains = newDomains
    },
    onEditDomain(oldDomainName, newDomainName) {
      this.domains = [...this.domains.map(domain => domain.name === oldDomainName ? { ...domain, name: newDomainName } : domain)]
    },
    onMakeDomainPrimary(newPrimaryDomainName) {
      const newDomains = []
      this.domains.forEach(domain => {
        if (domain.name === newPrimaryDomainName) newDomains.unshift({ name: newPrimaryDomainName, primary: true })
        else newDomains.push({ name: domain.name })
      })
      this.domains = newDomains
    },
    resetDomains() {
      if (this.liveDomains) this.domains = [ ...this.liveDomains ]
      else this.domains = []
    }
  },
  mounted() {
    if (this.liveDomains) this.domains = [ ...this.liveDomains ]
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
  @apply flex flex-col space-y-2 w-full border-b pb-4;
}

input.disabled {
  @apply cursor-not-allowed opacity-50;
}

@media (min-width: 450px) {
  .domainName__form {
    @apply space-x-4 space-y-0 items-start flex-row border-b-0 pb-0;
  }
  .domainName__form .button {
    @apply w-20;
  }
  .button__wrapper {
    @apply pt-5;
  }
}
</style>
