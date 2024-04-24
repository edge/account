<script setup>
import FAQ from '../FAQ.vue'
import PurchaseTable from '@/components/billing/PurchaseTable'
import { RouterLink } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()

const isCryptoView = Boolean(store.state.account?.useCryptoView)
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="box">
      <h4>Payments</h4>
      <PurchaseTable />
    </div>

    <div class="box">
      <h4>FAQ</h4>
      <FAQ>
        <div>
          <article>
            <header>
              <h5>When do I make payments?</h5>
            </header>
            <section>
              <p>
                When using an automatic payment method, the billing processor will typically process the payment immediately after your invoice is generated each month.
                If you have multiple outstanding invoices, the billing processor will attempt to settle all of them simultaneously.
                As a result, your payments may not directly correspond to individual invoices.
              </p>
              <p v-if="isCryptoView">
                If you do not use an automatic payment method, you will need to make sure you have enough XE on account to pay your invoices when they are prepared to avoid suspension of services.
                You can exchange USD for XE on the <RouterLink :to="{ name: 'Wallet' }" class="text-green">Wallet</RouterLink> page, and your purchases will appear in the table above.
              </p>
            </section>
          </article>
        </div>
      </FAQ>
    </div>
  </div>
</template>
