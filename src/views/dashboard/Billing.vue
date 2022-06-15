<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box overflow-hidden">
        <h4>Account Details</h4>
        <div class="details__section">
          <span class="details__title">Account No:</span>
          <div class="flex items-center justify-between">
            <span v-if="showAccountNumber" class="details__info">{{ formattedAccountNumber }}</span>
            <span v-else class="details__info">XXXX XXXX XXXX XXXX</span>
            <button
              @click.prevent="toggleShowAccountNumber"
              class="text-gray-400 hover:text-green"
            >
              <EyeIcon v-if="showAccountNumber" class="ml-2 w-5 h-5" />
              <EyeOffIcon v-if="!showAccountNumber" class="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="details__section overflow-hidden w-full">
          <span class="details__title">Wallet:</span>
          <div class="flex items-center relative">
            <a :href="explorerUrlWallet" target="_blank" rel="noreferrer" class="link truncate">
              <span class="details__info truncate">{{ account.wallet.address }}</span>
            </a>
            <button
              @click.prevent="copyToClipboard"
              class="text-gray-400 hover:text-green"
            >
              <DuplicateIcon class="ml-2 w-6 h-6" />
            </button>
            <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
          </div>
        </div>
        <div class="details__section balance">
          <div class="flex flex-col">
            <span class="details__title">Balance:</span>
            <span class="details__info">{{ formattedBalance }} <span class="currency">XE</span></span>
            <span class="details__info">$ {{ formattedUSDBalance }} <span class="currency">USD</span></span>
          </div>
          <button @click=toggleTopUpModal class="button button--success button--small h-10">
            Top Up Account
            <div><PlusIcon class="w-4 ml-2"/></div>
          </button>
        </div>
      </div>
      <div class="box">
        <h4>Consumption</h4>
        <span>Some consumption related info will go here. We'll make it look really cool. </span>
      </div>
    </div>
    <div class="box">
      <h4>Transactions</h4>
      <BillingTransactionTable />
    </div>

    <div class="box">
      <h4>Invoices</h4>
      <BillingInvoiceTable />
    </div>
    <TopUpModal
      v-show=showTopUpModal
      @modal-close=toggleTopUpModal
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import BillingInvoiceTable from '@/components/billing/BillingInvoiceTable'
import BillingTransactionTable from '@/components/billing/BillingTransactionTable'
import { DuplicateIcon } from '@heroicons/vue/outline'
import { PlusIcon } from '@heroicons/vue/outline'
import TopUpModal from '@/components/billing/TopUpModal'
import { mapState } from 'vuex'
import superagent from 'superagent'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Billing'
  },
  components: {
    BillingInvoiceTable,
    BillingTransactionTable,
    DuplicateIcon,
    EyeIcon,
    EyeOffIcon,
    PlusIcon,
    TopUpModal
  },
  data() {
    return {
      balance: null,
      copied: false,
      iBalance: null,
      rate: null,
      showAccountNumber: false,
      showTopUpModal: false
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    explorerUrlWallet() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.account.wallet.address}`
    },
    formattedAccountNumber() {
      // add space every 4 characters
      return this.account._key.replace(/.{4}/g, '$& ')
    },
    formattedBalance() {
      return (this.balance / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 6,
        minimumFractionDigits: 6
      })
    },
    formattedUSDBalance() {
      return (this.rate * this.balance / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })
    }
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    toggleShowAccountNumber() {
      this.showAccountNumber = !this.showAccountNumber
    },
    toggleTopUpModal() {
      this.showTopUpModal = !this.showTopUpModal
    },
    async updateBalance() {
      try {
        const info = await utils.accounts.getWallet(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        this.balance = info.balance
        await this.updateUSDRate()
      }
      catch (error) {
        console.error(error)
      }
    },
    async updateUSDRate() {
      try {
        const url = `${process.env.VUE_APP_INDEX_URL}/token/current`
        const response = await superagent.get(url)
        this.rate = response.body.usdPerXE
      }
      catch (error) {
        console.error(error)
      }
    }
  },
  mounted() {
    this.updateBalance()
    this.iBalance = setInterval(() => {
      this.updateBalance()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iBalance)
    this.iBalance = null
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full pb-2 mb-4 font-medium;
}

.details__section {
  @apply flex flex-col my-2;
}
.details__info {
  @apply text-gray-500 text-md;
}
.details__section.balance {
  @apply flex-row justify-between items-end
}

.link .details__info {
  @apply border-b border-gray-400;
}
.link:hover .details__info {
  @apply text-green-400 border-green-400;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}

.currency {
  @apply text-xs;
}

@media (max-width: 450px) {
  .details__section.balance {
    @apply flex-col items-start;
  }

  .details__section.balance .button {
    @apply w-full mt-2;
  }
}
</style>
