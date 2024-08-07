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
            <span class="info link" @click="openChat">Chat now</span>
          </div>
          <div class="product__section hours">
            <span class="label">Response time</span>
            <span class="info">
              &lt; 1 hour 08:00-20:00 UTC<br/>
              &lt; 8 hours 20:00-08:00 UTC
            </span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Phone support</span>
            <span class="info"><a href="tel:02080641444">020 8064 1444</a></span>
          </div>
          <div class="product__section account-manager">
            <span class="label">Account manager</span>
            <span class="info">
              <a :href="`mailto:${supportEmail}`">{{ supportEmail }}</a>
            </span>
          </div>
          <div v-if="prioritySupport.minDuration" class="product__section min-term">
            <span class="label">Subscription</span>
            <span class="info">Active ({{ downgradeAvailableText }})</span>
          </div>
        </template>
        <template v-slot:actions>
          <div class="flex flex-col">
            <button
              v-if="!prioritySupport.internal"
              @click.prevent="toggleCancelModal"
              :disabled="!downgradeAvailable"
              :class="`button button--small ${downgradeAvailable ? 'button--error' : 'border-gray text-gray'}`"
            >
              <span>Downgrade</span>
            </button>
            <div class="mt-2"><HttpError :error="priorityError" /></div>
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
            <span class="info">Available</span>
          </div>
          <div class="product__section hours">
            <span class="label">Response time</span>
            <span class="info">&lt; 24 hours</span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Phone support</span>
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
      <Product title="Current plan" :product="basicSupport">
        <template v-slot:icon>
          <InboxIcon/>
        </template>
        <template v-slot:detail>
          <div class="product__section live-chat">
            <span class="label">Live chat</span>
            <span class="info link" @click="openChat">Chat now</span>
          </div>
          <div class="product__section hours">
            <span class="label">Response time</span>
            <span class="info">&lt; 24 hours</span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Phone support</span>
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
      <Product title="Upgrade" :product="prioritySupport">
        <template v-slot:icon>
          <InboxInIcon/>
        </template>
        <template v-slot:detail>
          <div class="product__section live-chat">
            <span class="label">Live chat</span>
            <span class="info">Available</span>
          </div>
          <div class="product__section hours">
            <span class="label">Response time</span>
            <span class="info">
              &lt; 1 hour 08:00-20:00 UTC<br/>
              &lt; 8 hours 20:00-08:00 UTC
            </span>
          </div>
          <div class="product__section circleloop">
            <span class="label">Phone support</span>
            <span class="info">Available</span>
          </div>
          <div class="product__section account-manager">
            <span class="label">Account manager</span>
            <span class="info">Available</span>
          </div>
          <div v-if="prioritySupport.minDuration" class="product__section min-term">
            <span class="label">Minimum term</span>
            <span class="info">{{ prioritySupport.minDuration / 24 }} days</span>
          </div>
        </template>
        <template v-slot:actions>
          <div class="flex flex-col">
            <button
              v-if="!prioritySupport.internal && prioritySupport.active"
              @click.prevent="toggleSubscribeModal"
              class="button button--success button--small"
            >
              <span>Upgrade</span>
            </button>
            <div class="mt-2"><HttpError :error="priorityError" /></div>
          </div>
        </template>
      </Product>
    </div>

    <!-- Loading page data -->
    <div v-else class="flex items-center">
      <span>Loading products</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <SubscriptionConfirmation
      v-if="showSubscribeModal"
      @modal-confirm="() => subscribe(prioritySupport)"
      @modal-close="toggleSubscribeModal"
      :product="prioritySupport"
    />
    <CancelSubscriptionConfirmation
      v-if="showCancelModal"
      @modal-confirm="() => unsubscribe(prioritySupport)"
      @modal-close="toggleCancelModal"
      :product="prioritySupport"
    />
  </div>
</template>

<script>
/* global process */
import * as libcrisp from '@/crisp'
import * as utils from '@edge/account-utils'
import CancelSubscriptionConfirmation from '@/components/confirmations/CancelSubscriptionConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Product from '@/components/support/Product'
import SubscriptionConfirmation from '@/components/confirmations/SubscriptionConfirmation'
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
      showSubscribeModal: false,
      showCancelModal: false,

      wikiURL: 'https://wiki.edge.network',
      discordURL: 'https://discord.gg/3sEvuYJ',
      supportEmail: 'support@edge.network'
    }
  },
  components: {
    CancelSubscriptionConfirmation,
    HttpError,
    InboxIcon,
    InboxInIcon,
    LoadingSpinner,
    Product,
    SubscriptionConfirmation
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
      return this.products[process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT]
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
    isSubscribed(id) {
      if (this.products[id] === undefined) return false
      return this.subscriptions.find(s => s.product === id) !== undefined
    },
    openChat() {
      return libcrisp.session()
        // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#open-chatbox
        .then(crisp => crisp.push(['do', 'chat:open']))
        .catch(err => console.error(err))
    },
    async refreshProducts() {
      const getResult = await Promise.allSettled(productIDs.map(async id => {
        const { product } = await utils.getProduct(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, id)
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
        await utils.subscribeToProduct(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, product._key)
        await this.refreshSubscriptions()
      }
      catch (err) {
        this.errors[product._key] = err
        console.error(err)
      }
      finally {
        this.showSubscribeModal = false
      }
    },
    toggleCancelModal() {
      this.showCancelModal = !this.showCancelModal
    },
    toggleSubscribeModal() {
      this.showSubscribeModal = !this.showSubscribeModal
    },
    async unsubscribe(product) {
      delete this.errors[product._key]
      try {
        await utils.unsubscribeFromProduct(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, product._key)
        await this.refreshSubscriptions()
      }
      catch (err) {
        this.errors[product._key] = err
        console.error(err)
      }
      finally {
        this.showCancelModal = false
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
  @apply flex flex-col space-y-4;
}

.product__section {
  @apply flex flex-col overflow-hidden w-full;
}

.label {
  @apply font-bold block;
}

.info {
  @apply text-gray-500;
}

.info.inactive {
  @apply text-gray;
}

.help {
  @apply text-center flex flex-col w-full m-auto border-t-2 space-y-2;
}

.help .label {
  @apply mb-2 mt-4;
}

.product a, .link {
  @apply text-green cursor-pointer hover:text-green-600 hover:underline;
}


@screen lg {
  .products {
    @apply flex-row space-x-4 space-y-0;
  }

  .product {
    @apply w-1/2;
  }
}
</style>
