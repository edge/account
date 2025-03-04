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
      <h4>FAQ</h4>
      <FAQ><div>
        <article>
          <header>
            <h5>What happens if I don't pay an invoice?</h5>
          </header>
          <section>
            <p>
              If you don't have an automatic payment card set up or if a payment fails, your invoice will remain unpaid, resulting in the suspension of your account and services.
              This prevents you from making changes or deploying new services, and most services are suspended immediately, potentially disrupting your applications.
              We offer a 90-day grace period for DNS to minimize infrastructure disruption.
              Once all outstanding invoices are settled, the suspension will be lifted, and services should be restored shortly.
              If invoices remain unpaid for an extended period, your account may be disabled, and services may be permanently deleted to release resources.
            </p>
          </section>
        </article>

        <article>
          <header>
            <h5>How do I know if I have an unpaid invoice?</h5>
          </header>
          <section>
            <p>
              If you add an email address to your account, you will receive an email notification when a new invoice is generated and whenever your account status changes.
              You can also use your email address to log in to your Edge Account, keeping your account number secure.
              <span v-if="!accountEmail">
                <RouterLink :to="{ name: 'Settings' }" class="text-green">Add an email address</RouterLink>.
              </span>
              <span v-else>
                Your email address is <span class="text-green">{{ accountEmail }}</span>.
                You can <RouterLink :to="{ name: 'Settings' }" class="text-green">change your email address</RouterLink> if you need to.
              </span>
            </p>
            <p>
              In addition to email notifications, you will receive a notification within this account portal, regardless of whether you have added an email address to your account.
              To view your notifications, click on the notification inbox at the top of the page or
              <RouterLink :to="{ name: 'Notifications' }" class="text-green">click here to view your notifications</RouterLink>.
            </p>
          </section>
        </article>

        <article>
          <header>
            <h5>How do I pay an invoice?</h5>
          </header>
          <section>
            <p>
              To pay an invoice, add a payment card to your account and click "Use for automatic payments."
              The billing processor will then attempt to settle your invoices shortly after.
              Please allow 10-20 minutes for your payment to be confirmed.
              Once the payment is processed, any suspended services will be restored.
            </p>
            <p v-if="isCryptoView">
              If you prefer to fund your account manually, you can use a payment card to purchase XE or transfer XE in from another wallet.
              The billing processor will attempt to pay your invoices with XE from your account.
              You will pay invoices in XE according to the USD/XE exchange rate at the time the invoice was created, so make sure to stay aware of your XE balance and the exchange rate.
            </p>
          </section>
        </article>
      </div></FAQ>
    </div>
  </div>
</template>
