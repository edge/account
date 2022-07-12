<template>
  <div class="box overflow-hidden">
    <h4>Account Details</h4>
    <div class="details__section">
      <span class="details__title">Account No:</span>
      <div class="flex items-center">
        <span v-if="showAccountNumber" class="details__info monospace">{{ formattedAccountNumber }}</span>
        <span v-else class="details__info monospace"> {{ formattedAccountNumberMasked }}</span>
        <button
          @click.prevent="toggleShowAccountNumber"
          class="text-gray-400 hover:text-green"
        >
          <EyeIcon v-if="showAccountNumber" class="ml-2 w-5 h-5" />
          <EyeOffIcon v-if="!showAccountNumber" class="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
    <div class="details__section overflow-hidden w-max max-w-full">
      <span class="details__title">Wallet:</span>
      <div class="flex items-center relative">
        <a :href="explorerUrlWallet" target="_blank" rel="noreferrer" class="link truncate">
          <span class="details__info monospace truncate">{{ account.wallet.address }}</span>
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
        <span class="details__info">{{ formattedUSDBalance }} <span class="currency">USD</span></span>
      </div>
      <slot name="buttons"/>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import { DuplicateIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

export default {
  name: 'DetailsBox',
  components: {
    DuplicateIcon,
    EyeIcon,
    EyeOffIcon
  },
  data() {
    return {
      copied: false,
      showAccountNumber: false
    }
  },
  computed: {
    ...mapState(['account', 'balance', 'session']),
    explorerUrlWallet() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.account.wallet.address}`
    },
    formattedAccountNumber() {
      return format.accountNumber(this.account._key)
    },
    formattedAccountNumberMasked() {
      return format.accountNumberMasked(this.account._key)
    },
    formattedBalance() {
      return format.xe(this.balance.total.xe)
    },
    formattedUSDBalance() {
      return format.usd(this.usdBalance, 2)
    },
    usdBalance() {
      return this.balance.total.usd
    }
  },
  props: {
    addFunds: Function
  },
  methods: {
    toggleShowAccountNumber() {
      this.showAccountNumber = !this.showAccountNumber
    }
  }
}
</script>

<style scoped>
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
