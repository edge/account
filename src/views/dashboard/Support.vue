<template>
  <div class="mainContent__inner">

    <div class="flex justify-between">
      <h1>Support</h1>
    </div>

    <div v-if="loaded && isPriority" class="products priority">
      <Product title="Current plan" :product="prioritySupport">
        <template v-slot:icon>
          <InboxInIcon/>
        </template>
        <template v-slot:actions>
          <div v-if="prioritySupport.minDuration" class="section min-term">
            <h4>Subscription</h4>
            <span class="content">Active ({{ downgradeAvailableText }})</span>
          </div>
          <button
            v-if="!prioritySupport.internal"
            @click.prevent="() => unsubscribe(prioritySupport)"
            :disabled="!downgradeAvailable"
            :class="`button button--small ${downgradeAvailable ? 'button--error' : 'border-gray text-gray'}`"
          >
            <span>Downgrade</span>
          </button>
          <div v-if="priorityError">
            {{ priorityError.message }}
          </div>
        </template>
      </Product>
      <Product title="Downgrade" :product="basicSupport">
        <template v-slot:icon>
          <InboxIcon/>
        </template>
        <template v-slot:actions>
          <div class="help">
            <h4>Need more help?</h4>
            <a href="https://wiki.edge.network" target="_blank">Community Wiki</a>
            <a href="https://discord.gg/3sEvuYJ" target="_blank">Discord</a>
          </div>
        </template>
      </Product>
    </div>
    <div v-else-if="loaded && !isPriority" class="products basic">
      <Product title="Current plan" :icon="InboxIcon" :product="basicSupport">
        <template v-slot:icon>
          <InboxIcon/>
        </template>
        <template v-slot:actions>
          <div class="help">
            <h4>Need more help?</h4>
            <a href="https://wiki.edge.network" target="_blank">Community Wiki</a>
            <a href="https://discord.gg/3sEvuYJ" target="_blank">Discord</a>
          </div>
        </template>
      </Product>
      <Product title="Upgrade" :icon="InboxInIcon" :product="prioritySupport">
        <template v-slot:icon>
          <InboxInIcon/>
        </template>
        <template v-slot:actions>
          <div v-if="prioritySupport.minDuration" class="section min-term">
            <h4>Minimum term</h4>
            <span class="content">{{ prioritySupport.minDuration / 24}} days</span>
          </div>
          <button
            v-if="!prioritySupport.internal && prioritySupport.active"
            @click.prevent="() => subscribe(prioritySupport)"
            class="button button--success button--small"
          >
            <span>Upgrade</span>
          </button>
          <div v-if="priorityError">
            {{ priorityError.message }}
          </div>
        </template>
      </Product>
    </div>
    <div v-else class="flex items-center">
      <span>Loading products</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
  </div>
</template>

<script>
/* global process */
import * as api from '@/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Product from '@/components/support/Product'
import { mapState } from 'vuex'
import { InboxIcon, InboxInIcon } from '@heroicons/vue/outline'

const productIDs = [process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT]

export default {
  name: 'Support',
  title() {
    return 'Edge Account Portal » Support'
  },
  data() {
    return {
      loaded: false,
      errors: {},
      products: {}
    }
  },
  components: {
    InboxIcon,
    InboxInIcon,
    LoadingSpinner,
    Product
  },
  computed: {
    ...mapState(['session', 'subscriptions']),
    basicSupport() {
      return {
        name: 'Basic Support',
        summary: 'Basic support',
        liveChat: [true, 'Available'],
        hours: [true, '&lt; 24 hours'],
        circleloop: [false, 'Not available on basic plan'],
        accountManager: [false, 'Not available on basic plan'],
        price: {
          type: 'free'
        },
        active: true
      }
    },
    isPriority() {
      return this.isSubscribed(process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT)
    },
    priorityError() {
      return this.getError(process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT)
    },
    prioritySubscription() {
      return this.getSubscription(process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT)
    },
    prioritySupport() {
      if (!this.loaded) return null
      return {
        ...this.products[process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT],
        liveChat: [true, 'Available'],
        hours: [true, '&lt; 1 hour 08:00 UTC\n\n&lt; 8 hours 20:00-08:00 UTC'],
        circleloop: [true, this.isPriority ? '020 8064 1444' : 'Available'],
        accountManager: [true, this.isPriority ? 'support@edge.network' : 'Available']
      }
    },
    downgradeAvailable() {
      let t = this.prioritySubscription.created
      if (this.prioritySupport.minDuration) t += this.prioritySupport.minDuration * 60 * 60 * 1000
      return t < Date.now()
    },
    downgradeAvailableText() {
      const hour = 60 * 60 * 1000
      const day = 24 * hour
      let t = this.prioritySubscription.created
      if (this.prioritySupport.minDuration) t += this.prioritySupport.minDuration * hour
      if (t < Date.now()) return 'downgrade available'
      const diff = t - Date.now()
      if (diff < day) return `downgrade available in ${Math.ceil(diff/hour)} hours`
      return `downgrade available in ${Math.ceil(diff/day)} days`
    }
  },
  methods: {
    getError(id) {
      return this.errors[id]
    },
    getSubscription(id) {
      return this.subscriptions.find(s => s.product === id)
    },
    hasError(id) {
      return this.errors[id] !== undefined
    },
    isSubscribed(id) {
      if (this.products[id] === undefined) return false
      return this.subscriptions.find(s => s.product === id) !== undefined
    },
    async refreshProducts() {
      const getResult = await Promise.allSettled(productIDs.map(async id => {
        const { product } = await api.products.get(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, id)
        return product
      }))
      const products = getResult
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
      this.products = products.reduce((ps, p) => {
        ps[p._key] = p
        return ps
      }, {})
      this.loaded = true
    },
    refreshSubscriptions() {
      return this.$store.dispatch('updateSubscriptions')
    },
    async subscribe(product) {
      delete this.errors[product._key]
      try {
        await api.products.subscribe(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, product._key)
        await this.refreshSubscriptions()
      }
      catch (err) {
        this.errors[product._key] = err
        console.error(err)
      }
    },
    async unsubscribe(product) {
      delete this.errors[product._key]
      try {
        await api.products.unsubscribe(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, product._key)
        await this.refreshSubscriptions()
      }
      catch (err) {
        this.errors[product._key] = err
        console.error(err)
      }
    }
  },
  mounted() {
    this.refreshSubscriptions()
      .then(() => {
        this.refreshProducts()
      })
      .catch(err => console.error(err))
  }
}
</script>

<style scoped>
.products {
  @apply flex space-x-2;
}

.help {
  @apply text-center flex flex-col w-2/3 m-auto border-t-2 space-y-2;
}

.help h4 {
  @apply mb-2 mt-4;
}

.help a {
  @apply text-green;
}

.help a:hover {
  @apply text-green underline;
}
</style>
