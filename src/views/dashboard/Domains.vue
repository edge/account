<template>
  <div class="mainContent__inner">
    <h1>Edge Domains</h1>

    <!-- add new domain input -->
    <div class="box">
      <div class="flex flex-col space-y-2 w-full sm:space-x-4 sm:space-y-0 sm:items-end sm:flex-row">
        <!-- input -->
        <div class="flex-1 input-group">
          <label class="label">Domain Name</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Add a domain name"
            @keypress="addOnEnter"
            required
            v-model="v$.newDomainName.$model"
          />
        </div>

        <!-- add button -->
        <button
          @click.prevent="addDomain"
          :disabled="!canAddDomain"
          class="button button--success"
        >
          <div v-if="addingDomain" class="flex items-center">
            <span>Adding</span>
            <div><LoadingSpinner class="ml-1 w-4" /></div>
          </div>
          <span v-else>Add Domain</span>
        </button>

      </div>
      <!-- errors -->
      <div class="errorMessage">
        <span
          v-for="error in v$.newDomainName.$errors"
          :key="error.$uid"
          class="mt-2 errorMessage__text"
        >
          {{ error.$message }}
        </span>
      </div>
      <div class="mt-1">
        <HttpError :error=httpError />
      </div>
    </div>

    <DomainsList ref="domainsList" />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import * as validation from '../../utils/validation'
import DomainsList from '@/components/domain/DomainsList'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'Domains',
  title() {
    return 'Edge Account Portal » Domains'
  },
  components: {
    DomainsList,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      addingDomain: false,
      httpError: null,
      newDomainName: ''
    }
  },
  validations() {
    return {
      newDomainName: [validation.domain]
    }
  },
  computed: {
    ...mapState(['session']),
    canAddDomain() {
      return !this.v$.newDomainName.$invalid
    }
  },
  methods: {
    async addDomain() {
      if (!this.canAddDomain) return
      try {
        this.addingDomain = true
        await utils.dns.addZone(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.newDomainName
        )
        this.newDomainName = null
        await this.v$.$reset()
        this.$refs.domainsList.updateDomains()
      }
      catch (error) {
        this.httpError = error
      }
      setTimeout(async () => {
        this.addingDomain = false
      }, 800)
    },
    addOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.addDomain()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    async newDomainName() {
      this.httpError = null
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}
</style>
