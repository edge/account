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
      <FAQ>
        <div>
          <article>
            <header>
              <h4>When do I make payments?</h4>
            </header>
            <section>
              <p>If you use an automatic payment method, then the billing processor will normally take payment directly after your invoice is prepared each month.</p>
              <p>
                If you have multiple unpaid invoices, the billing processor will attempt to pay all of them at once,
                in which case your payments may not directly reflect your invoices.
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
