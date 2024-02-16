<template>
  <div class="mainContent__inner">
    <h1>Edge Domains</h1>

    <!-- balance suspend warning -->
    <DeploymentWarning v-if="balanceSuspend || balanceWarning" className="mb-4"/>

    <!-- add new domain input -->
    <div class="box">
      <div class="flex flex-col space-y-2 w-full sm:space-x-4 sm:space-y-0 sm:items-end sm:flex-row">
        <!-- input -->
        <div class="flex-1 input-group">
          <label class="label">Domain Name</label>
          <input
            v-model="v$.newDomainName.$model"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            class="w-full input input--floating"
            :class="balanceSuspend || balanceWarning ? 'cursor-not-allowed' : ''"
            placeholder="Add a domain name"
            @keypress.enter=addDomain
            @keyup="forceLowercaseDomainName"
            :disabled="balanceSuspend || balanceWarning"

          />
        </div>

        <!-- add button -->
        <button
          @click.prevent="addDomain"
          :disabled="!canAddDomain"
          class="button button--success button--small"
        >
          <div v-if="addingDomain" class="flex items-center">
            <span>Adding</span>
            <div><LoadingSpinner class="ml-1 w-4" /></div>
          </div>
          <span v-else>Add Domain</span>
        </button>

      </div>
      <!-- errors -->
      <div v-if=httpError class="mt-1">
        <HttpError :error=httpError />
      </div>
      <div v-if="alreadyExistsError" class="mt-2 bg-gray-300 rounded-md p-2">
        <span class="">This domain already exists within Edge DNS. If this is a mistake, please contact support@edge.network</span>
      </div>
      <ValidationError :errors="v$.newDomainName.$errors" />
      <!-- estimated costs -->
      <div class="flex flex-col items-baseline mt-2">
        <span class="text-green">Estimated Cost</span>
        <div v-if="dnsChargesApply" class="cost flex">
          <span><span class="flex-shrink-0">$0.0333</span> per day</span>
          <span class="dot" />
          <span><span class="flex-shrink-0">$1.00</span> per 30 days</span>
          <span class="dot" />
            <Tooltip position="top" text="Pay nothing for DNS when you use other Edge services">
              <div class="flex items-center space-x-1 flex-shrink-0 text-green">
                <span>Get DNS for free</span>
                <InformationCircleIcon class="w-4"/>
              </div>
            </Tooltip>
        </div>
          <Tooltip v-else position="top" text="Pay nothing for DNS when you use other Edge services">
            <div class="flex flex-wrap items-center">
              <span class="flex-shrink-0 mr-1">No charge for DNS</span>
             <InformationCircleIcon class="w-4 text-green"/>
            </div>
          </Tooltip>
          <!-- <a class="flex-shrink-0 text-green hover:text-green-600 underline cursor-pointer">Learn more.</a> -->
      </div>
    </div>
    <DomainsList ref="domainsList" />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import DeploymentWarning from '../../components/DeploymentWarning.vue'
import DomainsList from '@/components/domain/DomainsList'
import HttpError from '@/components/HttpError'
import { InformationCircleIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Tooltip from '@/components/Tooltip'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Domains',
  title() {
    return 'Edge Account Portal » Domains'
  },
  components: {
    DeploymentWarning,
    DomainsList,
    HttpError,
    InformationCircleIcon,
    LoadingSpinner,
    Tooltip,
    ValidationError
  },
  data() {
    return {
      alreadyExistsError: false,
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
    ...mapState(['account', 'balance', 'session']),
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
        const { zone } = await api.dns.addZone(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.account._key,
          this.newDomainName.toLowerCase()
        )
        domain = zone
        this.newDomainName = null
        await this.v$.$reset()
        this.$refs.domainsList.updateDomains()
      }
      catch (error) {
        const body = error.response.body
        if (body.param === 'zone' && body.reason === 'already exists') this.alreadyExistsError = true
        else this.httpError = error
      }
      setTimeout(async () => {
        this.addingDomain = false
        if (domain) this.$router.push({ name: 'Domain', params: { key: domain._key } })
      }, 800)
    },
    forceLowercaseDomainName() {
      const hasUppercase = /[A-Z]/.test(this.newDomainName)
      if (hasUppercase) this.newDomainName = this.newDomainName.toLowerCase()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    newDomainName() {
      this.alreadyExistsError = false
      this.httpError = null
    }
  }
}
</script>
<style scoped>
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
