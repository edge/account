<template>
  <div class="mainContent__inner">

    <div class="flex justify-between">
      <h1>Support</h1>
    </div>

    <!-- Page loaded and account is subscribed to priority support -->
    <div v-if="loaded && isPriority" class="products priority">
      <Product title="Current plan" :product="prioritySupport">
        <template v-slot:icon>
          <InboxInIcon/>
        </template>
        <template v-slot:detail>
          <div class="product__section live-chat">
            <span class="label">Live chat</span>
            <span class="info active">Available</span>
          </div>
          <div class="product__section hours">
            <span class="label">Hours</span>
            <span class="info active">
              &lt; 1 hour 08:00 UTC<br/>
              &lt; 8 hours 20:00-08:00 UTC
            </span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Circleloop</span>
            <span class="info active">020 8064 1444</span>
          </div>
          <div class="product__section account-manager">
            <span class="label">Account manager</span>
            <span class="info active">Available</span>
          </div>
          <div v-if="prioritySupport.minDuration" class="product__section min-term">
            <span class="label">Subscription</span>
            <span class="info">Active ({{ downgradeAvailableText }})</span>
          </div>
        </template>
        <template v-slot:actions>
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
        <template v-slot:detail>
          <div class="product__section live-chat">
            <span class="label">Live chat</span>
            <span class="info active">Available</span>
          </div>
          <div class="product__section hours">
            <span class="label">Hours</span>
            <span class="info active">&lt; 24 hours</span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Circleloop</span>
            <span class="info inactive">Not available on basic plan</span>
          </div>
          <div class="product__section account-manager">
            <span class="label">Account manager</span>
            <span class="info inactive">Not available on basic plan</span>
          </div>
        </template>
        <template v-slot:actions>
          <div class="help">
            <span class="label">Need more help?</span>
            <a :href="wikiURL" target="_blank">Community Wiki</a>
            <a :href="discordURL" target="_blank">Discord</a>
          </div>
        </template>
      </Product>
    </div>

    <!-- Page loaded and customer is -not- subscribed to priority support -->
    <div v-else-if="loaded && !isPriority" class="products basic">
      <Product title="Current plan" :icon="InboxIcon" :product="basicSupport">
        <template v-slot:icon>
          <InboxIcon/>
        </template>
        <template v-slot:detail>
          <div class="product__section live-chat">
            <span class="label">Live chat</span>
            <span class="info active">Available</span>
          </div>
          <div class="product__section hours">
            <span class="label">Hours</span>
            <span class="info active">&lt; 24 hours</span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Circleloop</span>
            <span class="info inactive">Not available on basic plan</span>
          </div>
          <div class="product__section account-manager">
            <span class="label">Account manager</span>
            <span class="info inactive">Not available on basic plan</span>
          </div>
        </template>
        <template v-slot:actions>
          <div class="help">
            <span class="label">Need more help?</span>
            <a :href="wikiURL" target="_blank">Community Wiki</a>
            <a :href="discordURL" target="_blank">Discord</a>
          </div>
        </template>
      </Product>
      <Product title="Upgrade" :icon="InboxInIcon" :product="prioritySupport">
        <template v-slot:icon>
          <InboxInIcon/>
        </template>
        <template v-slot:detail>
          <div class="product__section live-chat">
            <span class="label">Live chat</span>
            <span class="info active">Available</span>
          </div>
          <div class="product__section hours">
            <span class="label">Hours</span>
            <span class="info active">
              &lt; 1 hour 08:00 UTC<br/>
              &lt; 8 hours 20:00-08:00 UTC
            </span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Circleloop</span>
            <span class="info active">Available</span>
          </div>
          <div class="product__section account-manager">
            <span class="label">Account manager</span>
            <span class="info active">Available</span>
          </div>
          <div v-if="prioritySupport.minDuration" class="product__section min-term">
            <span class="label">Minimum term</span>
            <span class="info">{{ prioritySupport.minDuration / 24 }} days</span>
          </div>
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
      products: {},

      wikiURL: 'https://wiki.edge.network',
      discordURL: 'https://discord.gg/3sEvuYJ'
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
      let t = this.prioritySubscription?.created || 0
      if (this.prioritySupport.minDuration) t += this.prioritySupport.minDuration * 60 * 60 * 1000
      return t < Date.now()
    },
    downgradeAvailableText() {
      const hour = 60 * 60 * 1000
      const day = 24 * hour
      let t = this.prioritySubscription?.created || 0
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

.product__section {
  @apply flex flex-col overflow-hidden w-full;
}

.label {
  @apply font-bold block;
}

.info.inactive {
  @apply text-gray;
}

.info.active {
  @apply text-green;
}

.help {
  @apply text-center flex flex-col w-2/3 m-auto border-t-2 space-y-2;
}

.help .label {
  @apply mb-2 mt-4;
}

.help a {
  @apply text-green;
}

.help a:hover {
  @apply text-green underline;
}
</style>
