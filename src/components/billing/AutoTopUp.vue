<template>
  <div class="box flex flex-col">
    <h4>Auto Top-Up</h4>

    <div v-if="autoTopUpCard" class="flex items-center mb-5">
      <BadgeCheckIcon class="w-4 text-green mr-1" />
      <span>Auto top-up enabled</span>
    </div>

    <p>Enabling auto top-ups will automatically purchase XE whenever you balance is running low.</p>

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
      <div class="w-full" v-if="paymentMethods">
        <label for="">Select Payment Card</label>
        <Listbox v-model="paymentCard">
          <div class="relative w-full">
            <ListboxButton class="listButton">
              <span class="block truncate">XXXX XXXX XXXX {{ paymentCard && paymentCard.stripe.card.last4 }}</span>
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
        class="button button--small button--outline-error w-full md:max-w-xs"
        :disabled="enabling || disabling"
      >
        {{ disabling ? 'Disabling' : 'Disable'}}
        <div class="ml-1" v-if="disabling"><LoadingSpinner /></div>
      </button>
      <button
        @click=enableAutoTopUp
        class="button button--small button--success w-full md:max-w-xs"
        :disabled="!canEnable || enabling || disabling"
      >
        {{ autoTopUpCard ? 'Updat' : 'Enabl' }}{{ enabling ? 'ing' : 'e'}}
        <div class="ml-1" v-if="enabling"><LoadingSpinner /></div>
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
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    LoadingSpinner
  },
  data() {
    return {
      enabling: false,
      disabling: false,
      paymentCard: null,
      showDisableConfirmation: false,
      targetBalance: '10.00',
      threshold: '5.00'
    }
  },
  props: ['paymentMethods'],
  computed: {
    ...mapState(['account', 'balance', 'session']),
    autoTopUpCard() {
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
      this.targetBalance = this.account.topup.targetBalance.toFixed(2)
    }
  },
  watch: {
    autoTopUpCard() {
      if (this.account && this.account.topup) {
        this.paymentCard = this.paymentMethods.find(p => p._key === this.account.topup.paymentMethod)
      }
      else this.paymentCard = this.paymentMethods[0]
    },
    paymentMethods() {
      if (this.account && this.account.topup) {
        this.paymentCard = this.paymentMethods.find(p => p._key === this.account.topup.paymentMethod)
      }
      else this.paymentCard = this.paymentMethods[0]
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
  .form, .buttons {
    @apply flex-col space-x-0 space-y-2
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
