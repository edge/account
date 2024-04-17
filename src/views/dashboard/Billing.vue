<script setup>
import { effect } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const store = useStore()

function isSelected(path) {
  return route.fullPath.includes(path)
}


effect(() => {
  document.title = 'Edge Account Portal » Billing'

  if (route.fullPath === '/billing' || route.fullPath === '/billing/') {
    if (store.state.account && !store.state.account.topup) {
      router.push({ name: 'Payment Cards' })
    }
    else {
      router.push({ name: 'Invoices' })
    }
  }
})
</script>

<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div class="tabs flex space-x-2 pt-4">
      <div class="tab" :class="isSelected('invoices') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Invoices'}">Invoices</router-link>
      </div>
      <div class="tab" :class="isSelected('payments') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Payments'}">Payments</router-link>
      </div>
      <div class="tab" :class="isSelected('payment-cards') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Payment Cards'}">Payment Cards</router-link>
      </div>
      <div class="tab" :class="isSelected('promotions') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Promotions'}">Promo Codes</router-link>
      </div>
      <div v-if="store.state.account.useCryptoView" class="tab" :class="isSelected('wallet') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Wallet'}">Wallet</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>
