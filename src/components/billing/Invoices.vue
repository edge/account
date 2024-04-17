<script setup>
import BillingInvoiceTable from '@/components/billing/BillingInvoiceTable'
import FAQ from '@/components/FAQ.vue'
import { RouterLink } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()

const accountEmail = store.state.account?.email?.address
const isCryptoView = Boolean(store.state.account?.useCryptoView)
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="box">
      <h4>Invoices</h4>
      <BillingInvoiceTable />
    </div>
    <div class="box">
      <FAQ><div>
        <article>
          <header>
            <h4>What happens if I don't pay an invoice?</h4>
          </header>
          <section>
            <p v-if="isCryptoView">
              If you do not have an automatic payment card, or if your XE balance is insufficient to pay an invoice,
              you may be left with an unpaid invoice.
            </p>
            <p v-else>If you do not have an automatic payment card, or if an automatic payment fails, you may be left with an unpaid invoice.</p>
            <p>Your account and any services you are consuming will be suspended, and you won't be able to change your services or deploy any new services.</p>
            <p>
              Most services are suspended immediately, so any applications you are running may be disrupted.
              We offer a 90-day grace period for DNS to postpone infrastructure-level disruption.
            </p>
            <p>Your suspension will be removed after you have settled all outstanding invoices, and your services should be restored shortly afterwards.</p>
            <p>If you do not pay invoices for a long time, your account may be disabled and your services may be permanently deleted to release resources.</p>
          </section>
        </article>

        <article>
          <header>
            <h4>How do I know if I have an unpaid invoice?</h4>
          </header>
          <section>
            <p>If you add an email address to your account, you will receive an email notification when a new invoice is ready and whenever the status of your account changes.</p>
            <p>You can also use your email address to log in to your Edge Account, keeping your account number secure.</p>
            <p v-if="!accountEmail">
              <RouterLink :to="{ name: 'Account' }" class="text-green">Add an email address</RouterLink>
            </p>
            <p v-else>
              Your email address is <span class="text-green">{{ accountEmail }}</span>.
              You can <RouterLink :to="{ name: 'Account' }" class="text-green">change your email address</RouterLink> if you need to.
            </p>
            <p>
              You will also receive a notification within this app whether or not you add an email address to your account.
              Click your notification inbox at the top of the page or <RouterLink :to="{ name: 'Notifications' }" class="text-green">click here to view your notifications</RouterLink>.
            </p>
          </section>
        </article>

        <article>
          <header>
            <h4>How do I pay an invoice?</h4>
          </header>
          <section>
            <p>
              Add a payment card to your account then click "Use for automatic payments".
              The billing processor will attempt to pay your invoices shortly afterwards.
              Your payment will take 10-20 minutes to confirm, after which any suspended services will be restored.
            </p>
            <p v-if="isCryptoView">
              If you prefer to fund your account manually, you can use a payment card to purchase XE or transfer XE in from another wallet.
              The billing processor will attempt to pay your invoices with XE from your account.
              Your payment will take up to 15 minutes to confirm.
            </p>
            <p v-if="isCryptoView">
              You will pay invoices in XE according to the USD/XE exchange rate at the time the invoice was created.
              Make sure to stay aware of your XE balance and the exchange rate.
            </p>
          </section>
        </article>
      </div></FAQ>
    </div>
  </div>
</template>
