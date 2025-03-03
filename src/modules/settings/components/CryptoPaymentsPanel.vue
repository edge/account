<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import { useStore } from 'vuex'

const store = useStore()

async function toggleCryptoView() {
  if (!store.state.account) return

  await utils.updateAccount(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, {
    account: store.state.account._key,
    useCryptoView: !store.state.account.useCryptoView
  })

  store.dispatch('updateAccount')
}
</script>

<template>
  <div class="box">
    <h4>Crypto Payments</h4>
    <p class="text-gray-500">
      Edge runs on its own layer 0 blockchain, and payments are settled in its own coin, called XE, in the background.
      By default payment information in the account interface is presented in fiat.
      If you would prefer to see payment information in crypto, you can enable it here.
    </p>
    <button v-if="store.state.account.useCryptoView" @click="toggleCryptoView" class="text-sm py-3 button button--outline-error">Disable Crypto Payments</button>
    <button v-else @click="toggleCryptoView" class="text-sm py-3 button button--outline-success">Enable Crypto Payments</button>
  </div>
</template>
