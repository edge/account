<script setup>
/* global process */

import * as api from '@/account-utils'
import AddFundsCalculator from './AddFundsCalculator.vue'
import BillingTransactionTable from '@/components/billing/BillingTransactionTable'
import TransferXE from '@/components/billing/TransferXE'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { computed, ref } from 'vue'

const router = useRouter()
const store = useStore()

const showCheckout = ref(false)
const calculatedUSD = ref(0)
const calculatedXE = ref(0)
const purchasingUSD = ref(0)
const purchasingXE = ref(0)

const canStartPurchase = computed(() => calculatedUSD.value >= 1)

function onCalculatorUpdate({ usd, xe }) {
  calculatedUSD.value = usd
  calculatedXE.value = xe
}

async function startPurchase() {
  purchasingUSD.value = calculatedUSD
  purchasingXE.value = calculatedXE
  showCheckout.value = true

  const data = {
    account: store.state.account._key,
    send: {
      amount: calculatedUSD.value,
      currency: 'USD'
    },
    receive: {
      currency: 'XE'
    }
  }

  const { purchase } = await api.purchases.createPurchase(
    process.env.VUE_APP_ACCOUNT_API_URL,
    store.state.session._key,
    data
  )

  router.push({ name: 'Purchase', params: { id: purchase._key } })
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col lg:grid lg:grid-cols-2 space-y-4 lg:gap-x-6 lg:space-y-0">
      <TransferXE />
      <AddFundsCalculator @update="onCalculatorUpdate">
        <template v-slot:buttons>
          <button
            class="w-full md:max-w-xs mt-3 button button--small button--success sm:mt-0 self-end"
            @click="startPurchase"
            :disabled="!canStartPurchase"
          >
            Purchase XE
          </button>
          <div v-if="!canStartPurchase" class="errorMessage md:self-end mt-1">
            <span class="errorMessage__text">Minimum purchase is $1.00</span>
          </div>
        </template>
      </AddFundsCalculator>
    </div>
    <div class="box">
      <h4>Transactions</h4>
      <BillingTransactionTable />
    </div>
  </div>
</template>
