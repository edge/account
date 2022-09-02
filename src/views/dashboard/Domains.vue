<template>
  <div class="mainContent__inner">
    <h1>Edge Domains</h1>

    <!-- balance suspend warning -->
    <div v-if="balanceSuspend || balanceWarning" class="box mb-5 suspend">
      <div class="float-left mr-2 mt-2"><ExclamationIcon class="w-5 text-red" /></div>
      <!-- eslint-disable-next-line max-len -->
      <div class="mt-2 text-red">You are unable to add new domains while your available balance is below ${{ balance.threshold.warning.usd }}. Please add funds to re-enable this service.</div>
    </div>
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
      <div class="mt-1">
        <HttpError :error=httpError />
      </div>
      <div class="errorMessage">
        <span
          v-for="error in v$.newDomainName.$errors"
          :key="error.$uid"
          class="mt-2 errorMessage__text"
        >
          {{ error.$message }}
        </span>
      </div>
      <!-- estimated costs -->
      <div class="flex flex-col items-baseline mt-2">
        <span class="text-green">Estimated Cost</span>
        <div v-if="dnsChargesApply" class="cost flex">
          <span><span class="flex-shrink-0">$0.0333</span> per day</span>
          <span class="dot" />
          <span><span class="flex-shrink-0">$1.00</span> per 30 days</span>
          <span class="dot" />
          <a class="flex-shrink-0 text-green hover:text-green-600 underline cursor-pointer">Get DNS for free</a>
        </div>
        <div v-else class="flex flex-wrap items-center">
          <span class="flex-shrink-0 mr-2">No charge for DNS.</span>
          <a class="flex-shrink-0 text-green hover:text-green-600 underline cursor-pointer">Learn more.</a>
        </div>
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
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import useVuelidate from '@vuelidate/core'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Domains',
  title() {
    return 'Edge Account Portal » Domains'
  },
  components: {
    DomainsList,
    ExclamationIcon,
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
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['balance', 'session']),
    canAddDomain() {
      return !this.balanceWarning && !this.balanceSuspend && !this.v$.newDomainName.$invalid
    },
    dnsChargesApply() {
      return !this.balance.consumption.anyExcludingDNS
    }
  },
  methods: {
    async addDomain() {
      if (!this.canAddDomain) return
      let domain
      try {
        this.addingDomain = true
        domain = await utils.dns.addZone(
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
        if (domain) this.$router.push({ name: 'Domain', params: { key: domain._key } })
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
.box.suspend {
  @apply pt-4;
}

.cost {
  @apply flex items-center space-x-2.5;
}
.dot {
  @apply w-1 h-1 bg-gray-400 rounded-full
}

@media (max-width: 480px) {
  .cost {
    @apply flex-col items-start space-x-0 space-y-2 mt-2;
  }
  .dot {
    @apply hidden;
  }
}
</style>
