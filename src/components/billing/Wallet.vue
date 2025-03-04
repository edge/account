<script setup>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import AddFundsCalculator from './AddFundsCalculator.vue'
import BillingTransactionTable from '@/components/billing/BillingTransactionTable'
import FAQ from '../FAQ.vue'
import TransferXE from '@/components/billing/TransferXE'
import { useStore } from 'vuex'
import { RouterLink, useRouter } from 'vue-router'
import { computed, ref } from 'vue'

const router = useRouter()
const store = useStore()

const balanceXE = computed(() => store.state.balance.total.xe)
const balanceUSD = computed(() => store.state.balance.total.usd)
const explorerURL = `${process.env.VUE_APP_EXPLORER_URL}/wallet/${store.state.account.wallet.address}`

const minimumDeployBalance = computed(() => store.state.balance.threshold.warning.usd)
const differenceUSD = computed(() => minimumDeployBalance.value - store.state.balance.total.usd)
const differenceXE = computed(() => (differenceUSD.value / store.state.balance.token.usdPerXe) * 1e6)

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

  const { purchase } = await utils.beginStripePurchase(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, data)

  router.push({ name: 'Purchase', params: { id: purchase._key } })
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="box" style="padding-bottom: 0.5rem">
      <h4>Wallet</h4>
      <p v-if="balanceXE > 0">
        Your account has a balance of {{ format.xe(balanceXE) }} XE, which currently exchanges to ${{ format.usd(balanceUSD, 2) }} USD.
        <a :href="explorerURL" target="_blank" class="text-green">View in Explorer</a>
      </p>
      <p v-else>
        Your account balance is ${{ format.usd(0, 2) }}.
      </p>
      <p v-if="differenceXE > 0">
        The minimum required balance to deploy services is ${{ format.usd(minimumDeployBalance, 2) }} USD.
        You need to add at least {{ format.xe(differenceXE) }} XE to reach this threshold.
      </p>
    </div>

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

    <div class="box">
      <h4>FAQ</h4>
      <FAQ>
        <div>
          <article>
            <header>
              <h5>What am I looking at?</h5>
            </header>
            <section>
              <p>
                You're currently using the crypto view, which provides comprehensive visibility of your wallet and transactions on the XE blockchain.
                This page enables you to manage your account balance directly using XE.
                If you're new to cryptocurrency, you can <a href="https://wiki.edge.network/getting-and-storing-tokens/wallets" target="_blank" class="text-green">learn more about XE on the Edge Wiki</a>.
                Alternatively, if you prefer a more streamlined interface, you can <RouterLink :to="{ name: 'Settings' }" class="text-green">disable the crypto view</RouterLink>.
              </p>
            </section>
          </article>

          <article>
            <header>
              <h5>How do I withdraw funds from my account?</h5>
            </header>
            <section>
              <p>We don't currently offer the facility to withdraw XE from your account to another wallet.</p>
            </section>
          </article>
        </div>
      </FAQ>
    </div>
  </div>
</template>
