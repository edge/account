<script setup>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import PromotionTable from './PromotionTable.vue'
import ValidationError from '@/components/ValidationError.vue'
import { useStore } from 'vuex'
import { useVuelidate } from '@vuelidate/core'
import { computed, nextTick, reactive, ref } from 'vue'
import { helpers, required } from '@vuelidate/validators'

const { account, balance, session } = useStore().state

const formState = reactive({
  code: ''
})

const v$ = useVuelidate({
  code: [required, helpers.withMessage('Invalid format', value => /^[A-Za-z0-9-]+$/.test(value))]
}, formState)

const canSubmit = computed(() => v$.value.$anyDirty && !v$.value.$invalid)

const added = ref()
const loading = ref(false)
const error = ref()
const showPromotions = ref(true)

const errorLookup = {
  'exceeded maximum usage': 'Exceeded maximum usage.',
  'exceeded maximum concurrent usage': 'Exceeded maximum concurrent usage.',
  'incorrect code': 'Incorrect code.',
  'not found': 'We couldn\'t find that promo code.',
  'promotion expired': 'This promo code is no longer valid.'
}

const errorMessage = computed(() => {
  let msg = ''
  if (error.value) {
    if (error.value.response) msg = error.value.response.body.reason || error.value.response.body.message
    else msg = error.value.message
  }
  if (errorLookup[msg]) return errorLookup[msg]
  return msg
})

function formatXE(xe) {
  return `${format.xe(xe)} XE`
}

function formatUSD(usd) {
  return `$${format.usd(usd, 2)}`
}

async function reloadPromotions() {
  showPromotions.value = false
  await nextTick()
  showPromotions.value = true
}

async function submit() {
  loading.value = true
  error.value = undefined
  added.value = undefined
  try {
    const res = await utils.redeemPromoCode(process.env.VUE_APP_ACCOUNT_API_URL, session._key, {
      account: session.account,
      code: formState.code
    })
    added.value = res.entitlement
    v$.value.code.$model = ''
    v$.value.$reset()
    reloadPromotions()
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="box">
      <h4>Active Promo Codes</h4>
      <p v-if="balance && balance.credit.usd">
        You have {{ formatUSD(balance.credit.usd) }} <span v-if="account.useCryptoView">({{ formatXE(balance.credit.xe) }})</span> credit available.</p>
      <p v-else>You do not have any credit at the moment.</p>

      <PromotionTable v-if="showPromotions" limit="4" :status="['active', 'partConsumed']" />
    </div>

    <div class="box">
      <h4>Redeem a Promo Code</h4>

      <p>Redeem a code to claim credit or a discount:</p>

      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.code.$model"
          label="Promo code"
          autocomplete="off"
          class="text-center overflow-hidden flex-1 px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
          placeholder="Enter Promo Code"
          @keypress.enter=submit
        />
        <button
          class="rounded-l-none text-sm py-3 button button--success w-32"
          @click="submit"
          :disabled="!canSubmit"
        >
          <div v-if="loading" class="flex flex-row items-center">
            <span>Redeeming...</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Redeem</span>
        </button>
      </div>
      <div class="mt-2 mb-2">
        <ValidationError :errors="v$.code.$errors" />
      </div>

      <div v-if="added" class="bg-green mb-4 p-2 rounded-4 overflow-hidden text-center text-white">
        The code <strong>{{ added.code }}</strong> was successfully redeemed.
      </div>
      <div v-else-if="error" class="bg-red mb-4 p-2 rounded-4 overflow-hidden text-center text-white">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>
