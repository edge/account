<template>
  <div class="box flex flex-col">
    <h4>Auto Payments</h4>

    <div v-if="autoTopUpEnabled" class="flex items-center mb-5">
      <BadgeCheckIcon class="w-4 text-green mr-1" />
      <span>Auto payments enabled</span>
    </div>

    <p>Enabling auto payments will automatically purchase XE whenever you balance is running low.</p>

    <div v-if="paymentMethods.length" class="form flex space-x-2 mb-5">
      <div class="w-full">
        <label for="">Target balance</label>
        <div class="currency flex justify-between">
          <input type="number" v-model="targetBalance" @focusout="formatTargetBalance" />
          USD
        </div>
        <div class="errorMessage mt-1" v-if="targetBalance < 10">
          <span class="errorMessage__text">Minimum target balance is $10</span>
        </div>
      </div>
      <div class="w-full">
        <label for="">Select Payment Card</label>
        <select v-model="paymentCard" name="" id="" class="w-full">
          <option v-for="p in paymentMethods" :key="p._key" :value="p._key">
            XXXX XXXX XXXX {{ p.stripe.card.last4 }}
          </option>
        </select>
      </div>
    </div>
    <div v-else>
      <p class="text-red">Please add a saved payment card below to enable auto payments.</p>
    </div>

    <div class="buttons flex space-x-2">
      <button
        @click=enableAutoTopUp
        class="button button--small button--success w-full md:max-w-xs"
        :disabled="!canEnable || enabling || disabling"
      >
        {{ autoTopUpEnabled ? 'Updat' : 'Enabl' }}{{ enabling ? 'ing' : 'e'}}
        <div class="ml-1" v-if="enabling"><LoadingSpinner /></div>
      </button>
      <button
        v-if="autoTopUpEnabled"
        @click=toggleDisableConfirmationModal
        class="button button--small button--error w-full md:max-w-xs"
        :disabled="enabling || disabling"
      >
        {{ disabling ? 'Disabling' : 'Disable'}}
        <div class="ml-1" v-if="disabling"><LoadingSpinner /></div>
      </button>
    </div>
    <DisableAutoTopUpConfirmation
      v-if=showDisableConfirmation
      @modal-confirm=disableAutoTopUp
      @modal-close=toggleDisableConfirmationModal
    />
  </div>
</template>

<script>
/* global process*/

import * as utils from '@/account-utils'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import DisableAutoTopUpConfirmation from '@/components/confirmations/DisableAutoTopUpConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'AutoTopUp',
  components: {
    BadgeCheckIcon,
    DisableAutoTopUpConfirmation,
    LoadingSpinner
  },
  data() {
    return {
      enabling: false,
      disabling: false,
      paymentCard: null,
      showDisableConfirmation: false,
      targetBalance: '10.00'
    }
  },
  props: ['paymentMethods'],
  computed: {
    ...mapState(['account', 'balance', 'session']),
    autoTopUpEnabled() {
      return this.account.topup
    },
    canEnable() {
      return this.paymentCard && this.targetBalance >= 10
    }
  },
  methods: {
    async disableAutoTopUp() {
      try {
        this.disabling = true
        await utils.billing.disableAutoTopUp(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        this.toggleDisableConfirmationModal()
        setTimeout(() => {
          this.disabling = false
          this.paymentCard = null
          this.$store.dispatch('updateAccount')
        }, 1000)
      }
      catch (error) {
        console.error(error)
        this.disabling = false
      }
    },
    async enableAutoTopUp() {
      try {
        this.enabling = true
        await utils.billing.enableAutoTopUp(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            paymentMethod: this.paymentCard,
            targetBalance: Number(this.targetBalance)
          }
        )
        setTimeout(() => {
          this.enabling = false
          this.$store.dispatch('updateAccount')
        }, 1000)
      }
      catch (error) {
        console.error(error)
        this.enabling = false
      }
    },
    formatTargetBalance() {
      if (!this.targetBalance) this.targetBalance = 0
      this.targetBalance = Number(this.targetBalance).toFixed(2)
    },
    toggleDisableConfirmationModal() {
      this.showDisableConfirmation = !this.showDisableConfirmation
    }
  },
  mounted() {
    if (this.account.topup) {
      this.paymentCard = this.account.topup.paymentMethod
      this.targetBalance = this.account.topup.targetBalance.toFixed(2)
    }
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

.currency {
  @apply border border-gray-500 rounded w-full py-2 px-4;
}

/* remove input defualy focus and arrows */
input:focus, select:focus {
  outline: none;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
  @apply w-full;
}

select {
  @apply w-full border border-gray-500 bg-white rounded w-full p-2;
}

@media (max-width: 500px) {
  .form, .buttons {
    @apply flex-col space-x-0 space-y-2
  }
}
</style>
