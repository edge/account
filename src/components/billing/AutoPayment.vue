<template>
  <div class="box flex flex-col">
    <h4>Pay by Credit Card</h4>

    <div v-if="autoPaymentCard" class="flex items-center mb-4">
      <div><BadgeCheckIcon class="w-4 text-green mr-1" /></div>
      <span>Pay by Credit Card enabled.</span>
    </div>

    <p>
      <span v-if="autoPaymentCard">Your selected credit card will be used to pay your monthly invoices automatically.</span>
      <span v-else>Select a saved credit card to pay your monthly invoices automatically.</span>
      <span> Your card will be charged on the 1st of each month.</span>
    </p>

    <p>If you disable Pay by Credit Card, your services may be suspended if you have account doesn't have sufficient funds.</p>

    <div v-if="paymentMethods.length" class="form flex flex-col space-y-1 mb-4">
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
      <p class="text-red">Please add a saved payment card below to be able to enable Pay by Credit Card.</p>
    </div>

    <div class="buttons flex space-x-2 justify-end">
      <button
        v-if="autoPaymentCard"
        @click=toggleDisableConfirmationModal
        class="button button--small button--outline-error w-full"
        :disabled="enabling || disabling"
      >
        {{ disabling ? 'Disabling' : 'Disable'}}
        <div class="ml-1" v-if="disabling"><LoadingSpinner /></div>
      </button>
      <button
        @click=enableAutoPayment
        class="button button--small button--success w-full"
        :class="autoPaymentCard ? '' : 'md:max-w-xs'"
        :disabled="!canEnable || enabling || disabling"
      >
        {{ autoPaymentCard ? 'Updat' : 'Enabl' }}{{ enabling ? 'ing' : 'e'}}
        <div class="ml-1" v-if="enabling"><LoadingSpinner /></div>
      </button>
    </div>
    <div v-if=httpError class="mt-2">
      <HttpError :error=httpError />
    </div>
    <DisableAutoPaymentsConfirmation
      v-if=showDisableConfirmation
      @modal-confirm=disableAutoPayment
      @modal-close=toggleDisableConfirmationModal
    />
  </div>
</template>

<script>
/* global process*/

import * as api from '@/account-utils'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import DisableAutoPaymentsConfirmation from '@/components/confirmations/DisableAutoPaymentsConfirmation'
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
  name: 'AutoPayment',
  components: {
    BadgeCheckIcon,
    CheckIcon,
    ChevronDownIcon,
    DisableAutoPaymentsConfirmation,
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
      showDisableConfirmation: false
    }
  },
  props: ['paymentMethods'],
  computed: {
    ...mapState(['account', 'config', 'session']),
    autoPaymentCard() {
      return this.account && this.account.topup && this.account.topup.paymentMethod
    },
    canEnable() {
      return this.paymentCard && (!this.account.topup || this.paymentCard._key !== this.account.topup.paymentMethod)
    }
  },
  methods: {
    async disableAutoPayment() {
      this.httpError = ''
      try {
        this.disabling = true
        await api.billing.disableAutoPayment(
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
    async enableAutoPayment() {
      this.httpError = ''
      try {
        this.enabling = true
        await api.billing.enableAutoPayment(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          { paymentMethod: this.paymentCard._key }
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
    toggleDisableConfirmationModal() {
      this.showDisableConfirmation = !this.showDisableConfirmation
    }
  },
  watch: {
    autoPaymentCard(newCard) {
      if (newCard) this.paymentCard = this.paymentMethods.find(p => p._key === newCard)
      else this.paymentCard = this.paymentMethods[0]
    },
    paymentMethods() {
      if (this.autoPaymentCard) {
        this.paymentCard = this.paymentMethods.find(p => p._key === this.autoPaymentCard)
      }
      else this.paymentCard = this.paymentMethods[0]
    }
  }
}
</script>

<style scoped>
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
