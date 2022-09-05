<template>
  <div class="box flex flex-col">
    <h4>Auto Top-Up</h4>

    <div v-if="autoTopUpCard" class="flex items-center mb-5">
      <div><BadgeCheckIcon class="w-4 text-green mr-1" /></div>
      <span>Auto top-up enabled.</span>
    </div>

    <!-- eslint-disable-next-line max-len -->
    <p>{{ autoTopUpCard ? "If" : "When you enable auto top-ups, if" }} your balance drops below your <strong>threshold</strong> XE will be purchased to bring your account funds back to your <strong>target balance</strong>.</p>

    <div v-if="paymentMethods.length" class="form flex flex-col space-y-1 mb-5">
      <div class="input-wrapper">
        <div class="w-full">
          <label class="block mb-1">Threshold</label>
          <div class="currency flex justify-between">
            <input
              type="number"
              v-model="threshold"
              @focusout="formatThreshold"
              @keypress="enableOnEnter"
            />
            USD
          </div>
        </div>
        <div class="w-full">
          <label class="block mb-1">Target balance</label>
          <div class="currency flex justify-between">
            <input
              type="number"
              v-model="targetBalance"
              @focusout="formatTargetBalance"
              @keypress="enableOnEnter"
            />
            USD
          </div>
        </div>
      </div>
      <div class="errorMessage" v-if="targetBalanceError">
        <span class="errorMessage__text">{{ targetBalanceError }}</span>
      </div>
      <div class="w-full pt-1" v-if="paymentMethods">
        <label class="block mb-1">Select Payment Card</label>
        <Listbox v-model="paymentCard">
          <div class="relative w-full">
            <ListboxButton class="listButton">
              <span class="block truncate">{{ paymentCard && `XXXX XXXX XXXX ${paymentCard.stripe.card.last4}` }}</span>
              <span class="listButton__icon">
                <ChevronDownIcon class="w-5 h-5" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions class="listOptions">
                <ListboxOption
                  v-slot="{ active, selected }"
                  v-for="p in paymentMethods"
                  :key="p._key"
                  :value="p"
                  as="template"
                >
                  <li :class="active ? 'active' : ''" class="listOption">
                    <span :class="'block truncate'">XXXX XXXX XXXX {{ p.stripe.card.last4 }}</span>
                    <span v-if="selected" class="checkmark" >
                      <CheckIcon class="w-5 h-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>
    </div>
    <div v-else>
      <p class="text-red">Please add a saved payment card below to enable auto top-ups.</p>
    </div>

    <div class="buttons flex space-x-2 justify-end">
      <button
        v-if="autoTopUpCard"
        @click=toggleDisableConfirmationModal
        class="button button--small button--outline-error w-full"
        :disabled="enabling || disabling"
      >
        {{ disabling ? 'Disabling' : 'Disable'}}
        <div class="ml-1" v-if="disabling"><LoadingSpinner /></div>
      </button>
      <button
        @click=enableAutoTopUp
        class="button button--small button--success w-full"
        :class="autoTopUpCard ? '' : 'md:max-w-xs'"
        :disabled="!canEnable || enabling || disabling"
      >
        {{ autoTopUpCard ? 'Updat' : 'Enabl' }}{{ enabling ? 'ing' : 'e'}}
        <div class="ml-1" v-if="enabling"><LoadingSpinner /></div>
      </button>
    </div>
    <div v-if=httpError class="mt-2">
      <HttpError :error=httpError />
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
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/vue/outline'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'

export default {
  name: 'AutoTopUp',
  components: {
    BadgeCheckIcon,
    CheckIcon,
    ChevronDownIcon,
    DisableAutoTopUpConfirmation,
    HttpError,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    LoadingSpinner
  },
  data() {
    return {
      disabling: false,
      enabling: false,
      httpError: '',
      paymentCard: null,
      showDisableConfirmation: false,
      targetBalance: '10.00',
      targetBalanceError: null,
      threshold: '5.00'
    }
  },
  props: ['paymentMethods'],
  computed: {
    ...mapState(['account', 'config', 'session']),
    autoTopUpCard() {
      return this.account && this.account.topup && this.account.topup.paymentMethod
    },
    canEnable() {
      return this.paymentCard && this.isTargetBalanceAboveMin && this.isThresholdAboveMin
    },
    isTargetBalanceAboveMin() {
      return Number(this.targetBalance) >= this.minTargetBalance
        && Number(this.targetBalance) >= Number(this.threshold) + this.thresholdBuffer
    },
    isThresholdAboveMin() {
      return Number(this.threshold) >= this.minThreshold
    },
    minTargetBalance() {
      return this.config.topup.minTargetBalance
    },
    minThreshold() {
      return this.config.topup.minThreshold
    },
    thresholdBuffer() {
      return this.config.topup.thresholdBuffer
    }
  },
  methods: {
    async disableAutoTopUp() {
      this.httpError = ''
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
        this.httpError = error
        this.disabling = false
      }
    },
    enableOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.enableAutoTopUp()
    },
    async enableAutoTopUp() {
      this.httpError = ''
      try {
        this.enabling = true
        await utils.billing.enableAutoTopUp(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            paymentMethod: this.paymentCard._key,
            targetBalance: Number(this.targetBalance),
            threshold: Number(this.threshold)
          }
        )
        setTimeout(() => {
          this.enabling = false
          this.$store.dispatch('updateAccount')
        }, 1000)
      }
      catch (error) {
        this.httpError = error
        this.enabling = false
      }
    },
    formatTargetBalance() {
      if (!this.targetBalance) this.targetBalance = 0
      this.targetBalance = Number(this.targetBalance).toFixed(2)
    },
    formatThreshold() {
      if (!this.threshold) this.threshold = 0
      this.threshold = Number(this.threshold).toFixed(2)
    },
    setTargetBalanceError() {
      const targetBalance = Number(this.targetBalance)
      const threshold = Number(this.threshold)
      const thresholdBuffer = this.config.topup.thresholdBuffer
      /* eslint-disable max-len */
      if (targetBalance < this.minTargetBalance) this.targetBalanceError = `Minimum target balance is $${this.minTargetBalance}.`
      else if (threshold < this.minThreshold) this.targetBalanceError = `Minimum threshold is $${this.minThreshold}.`
      else if (targetBalance < threshold + thresholdBuffer) this.targetBalanceError = `Target balance must be $${thresholdBuffer} greater than the threshold.`
      /* eslint-enable max-len */
      else this.targetBalanceError = null
    },
    toggleDisableConfirmationModal() {
      this.showDisableConfirmation = !this.showDisableConfirmation
    }
  },
  mounted() {
    if (this.account.topup) {
      this.targetBalance = this.account.topup.targetBalance.toFixed(2)
      this.threshold = this.account.topup.threshold.toFixed(2)
    }
    else {
      this.targetBalance = this.config.topup.minTargetBalance.toFixed(2)
      this.threshold = this.config.topup.minThreshold.toFixed(2)
    }
  },
  watch: {
    autoTopUpCard(newCard) {
      if (newCard) {
        this.paymentCard = this.paymentMethods.find(p => p._key === newCard)
      }
      else this.paymentCard = this.paymentMethods[0]
    },
    paymentMethods() {
      if (this.autoTopUpCard) {
        this.paymentCard = this.paymentMethods.find(p => p._key === this.autoTopUpCard)
      }
      else this.paymentCard = this.paymentMethods[0]
    },
    targetBalance() {
      this.setTargetBalanceError()
    },
    threshold() {
      this.setTargetBalanceError()
    }
  }
}
</script>

<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full mb-4 font-medium;
}

.input-wrapper {
  @apply flex space-x-2;
}

.currency {
  @apply border border-gray-500 rounded w-full py-2 px-4;
}

/* remove input defualy focus and arrows */
input:focus {
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

@media (max-width: 500px) {
  .form, .buttons, .input-wrapper {
    @apply flex-col space-x-0 space-y-2;
  }
}

/* ListBox */
.listButton {
  @apply relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-500 rounded cursor-pointer;
  @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
}
.listButton__icon {
  @apply absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400;
}

/* options */
.listOptions {
  @apply absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
}
.listOption {
  @apply relative flex items-center justify-between cursor-pointer py-2 pl-4 pr-4 text-gray-900 cursor-default select-none;
}
.listOption.active {
  @apply text-green bg-green bg-opacity-5;
}
/* checkmark */
.checkmark {
  @apply flex items-center pl-3 text-green;
}
</style>
