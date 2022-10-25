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
          <button
            v-if="!prioritySupport.internal"
            @click.prevent="() => unsubscribe(prioritySupport)"
            class="button button--small border-gray text-gray"
          >
            <span>Downgrade</span>
          </button>
        </template>
      </Product>
      <Product title="Downgrade" :product="basicSupport">
        <template v-slot:icon>
          <InboxIcon/>
        </template>
        <template v-slot:actions>
          <h3>Need more help?</h3>
          <a href="https://wiki.edge.network" target="_blank">Community Wiki</a>
          <a href="https://discord.gg/3sEvuYJ" target="_blank">Discord</a>
        </template>
      </Product>
    </div>
    <div v-else-if="loaded && !isPriority" class="products basic">
      <Product title="Current plan" :icon="InboxIcon" :product="basicSupport">
        <template v-slot:icon>
          <InboxIcon/>
        </template>
        <template v-slot:actions>
          <h3>Need more help?</h3>
          <a href="https://wiki.edge.network" target="_blank">Community Wiki</a>
          <a href="https://discord.gg/3sEvuYJ" target="_blank">Discord</a>
        </template>
      </Product>
      <Product title="Upgrade" :icon="InboxInIcon" :product="prioritySupport">
        <template v-slot:icon>
          <InboxInIcon/>
        </template>
        <template v-slot:actions>
          <button
            v-if="!prioritySupport.internal && prioritySupport.active"
            @click.prevent="() => subscribe(prioritySupport)"
            class="button button--success button--small"
          >
            <span>Upgrade</span>
          </button>
          <div v-if="priorityError">
            {{priorityError.message}}
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
        liveChat: 'Available',
        hours: '< 24 hours',
        circleloop: 'Not available on basic plan',
        accountManager: 'Not available on basic plan',
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
    prioritySupport() {
      if (!this.loaded) return null
      return {
        ...this.products[process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT],
        liveChat: 'Available',
        hours: '< 1 hour 08:00 UTC\n\n< 8 hours 20:00-08:00 UTC',
        circleloop: this.isPriority ? '020 8064 1444' : 'Available',
        accountManager: this.isPriority ? 'support@edge.network' : 'Available'
      }
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

/* list item */
.products .product {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-gray-400 rounded-md p-5;
  @apply flex-col w-1/2;
  @apply cursor-pointer transition-all duration-100;
}
</style>
